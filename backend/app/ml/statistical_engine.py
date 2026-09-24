import math
from typing import List, Dict, Any

class StatisticalAnomalyDetector:
    """
    Statistical Anomaly Detection Service for MPLADS Projects.
    Calculates population mean, median, standard deviation, and Z-scores (z = (x - mean) / std_dev).
    Flags statistical deviations without making false claims of fraud.
    """

    @staticmethod
    def _calculate_mean_and_std(values: List[float]) -> tuple[float, float, float]:
        if not values:
            return 0.0, 0.0, 0.0

        n = len(values)
        mean_val = sum(values) / n
        sorted_vals = sorted(values)
        median_val = sorted_vals[n // 2] if n % 2 == 1 else (sorted_vals[n // 2 - 1] + sorted_vals[n // 2]) / 2.0

        variance = sum((x - mean_val) ** 2 for x in values) / max(1, n - 1)
        std_dev = math.sqrt(variance)

        return mean_val, median_val, std_dev

    @classmethod
    def evaluate_population(cls, projects: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
        """Calculates baseline statistical metrics for the project population."""
        costs = [float(p.get("sanctioned_cost", p.get("sanctionedCost", 0.0))) for p in projects]
        gaps = [float(p.get("financial_progress", 0.0)) - float(p.get("physical_progress", 0.0)) for p in projects]
        peer_ratios = [float(p.get("ai_features", {}).get("peer_cost_ratio", 1.0)) for p in projects]
        durations = [float(p.get("ai_features", {}).get("project_duration_days", 365)) for p in projects]

        cost_mean, cost_med, cost_std = cls._calculate_mean_and_std(costs)
        gap_mean, gap_med, gap_std = cls._calculate_mean_and_std(gaps)
        peer_mean, peer_med, peer_std = cls._calculate_mean_and_std(peer_ratios)
        dur_mean, dur_med, dur_std = cls._calculate_mean_and_std(durations)

        return {
            "sanctioned_cost": {"mean": cost_mean, "median": cost_med, "std_dev": cost_std},
            "progress_gap": {"mean": gap_mean, "median": gap_med, "std_dev": gap_std},
            "peer_cost_ratio": {"mean": peer_mean, "median": peer_med, "std_dev": peer_std},
            "duration": {"mean": dur_mean, "median": dur_med, "std_dev": dur_std}
        }

    @classmethod
    def evaluate_project(cls, target_project: Dict[str, Any], population_stats: Dict[str, Dict[str, float]]) -> List[Dict[str, Any]]:
        findings = []

        cost = float(target_project.get("sanctioned_cost", target_project.get("sanctionedCost", 0.0)))
        gap = float(target_project.get("financial_progress", 0.0)) - float(target_project.get("physical_progress", 0.0))
        peer_ratio = float(target_project.get("ai_features", {}).get("peer_cost_ratio", 1.0))

        # 1. Cost Z-score evaluation
        c_stats = population_stats.get("sanctioned_cost", {})
        if c_stats.get("std_dev", 0) > 0:
            cost_z = round((cost - c_stats["mean"]) / c_stats["std_dev"], 2)
            if cost_z >= 2.0:
                findings.append({
                    "reason_code": "STATISTICAL_COST_OUTLIER",
                    "severity": "HIGH_PRIORITY" if cost_z >= 3.0 else "ATTENTION",
                    "z_score": cost_z,
                    "explanation": f"Sanctioned cost (₹{cost:,.2f}) is a statistical outlier (Z-score = {cost_z:+.2f}).",
                    "affected_field": "sanctioned_cost",
                    "recommended_action": "Verify budget sanction breakdown against sector peer benchmark."
                })

        # 2. Progress Gap Z-score evaluation
        g_stats = population_stats.get("progress_gap", {})
        if g_stats.get("std_dev", 0) > 0:
            gap_z = round((gap - g_stats["mean"]) / g_stats["std_dev"], 2)
            if gap_z >= 2.0:
                findings.append({
                    "reason_code": "STATISTICAL_PROGRESS_GAP_OUTLIER",
                    "severity": "HIGH_PRIORITY" if gap_z >= 3.0 else "ATTENTION",
                    "z_score": gap_z,
                    "explanation": f"Financial-to-physical progress gap ({gap:.1f}%) significantly exceeds population mean (Z-score = {gap_z:+.2f}).",
                    "affected_field": "financial_progress",
                    "recommended_action": "Conduct site audit to verify reported physical progress milestone."
                })

        # 3. Peer Cost Ratio Z-score evaluation
        p_stats = population_stats.get("peer_cost_ratio", {})
        if p_stats.get("std_dev", 0) > 0:
            peer_z = round((peer_ratio - p_stats["mean"]) / p_stats["std_dev"], 2)
            if peer_z >= 2.0:
                findings.append({
                    "reason_code": "STATISTICAL_PEER_RATIO_OUTLIER",
                    "severity": "ATTENTION",
                    "z_score": peer_z,
                    "explanation": f"Peer cost ratio ({peer_ratio:.2f}x) is significantly above sector average (Z-score = {peer_z:+.2f}).",
                    "affected_field": "sector",
                    "recommended_action": "Review sector cost specifications."
                })

        return findings
