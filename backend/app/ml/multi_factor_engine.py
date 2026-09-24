from typing import Dict, Any, List, Optional
from datetime import datetime
from app.ml.rule_engine import RuleEngine
from app.ml.statistical_engine import StatisticalAnomalyDetector
from app.ml.anomaly_model import IsolationForestAnomalyDetector
from app.ml.trust_score_engine import TrustScoreEngine

class MultiFactorAnomalyEngine:
    """
    Synergistic AI engine combining:
    1. Deterministic Rule Engine
    2. Statistical Z-Score Detector
    3. Scikit-Learn Isolation Forest ML Model
    4. 6-Factor Weighted Trust Score Engine
    
    Generates single unified verification assessment without false fraud claims.
    """

    _ml_detector: Optional[IsolationForestAnomalyDetector] = None
    _cached_pop_stats: Optional[Dict[str, Dict[str, float]]] = None
    _pop_size: int = 0

    @classmethod
    def get_ml_detector(cls) -> IsolationForestAnomalyDetector:
        if cls._ml_detector is None:
            cls._ml_detector = IsolationForestAnomalyDetector()
        return cls._ml_detector

    @classmethod
    def train_ml_model_if_needed(cls, population_projects: List[Dict[str, Any]]):
        detector = cls.get_ml_detector()
        if not detector.is_trained:
            detector.fit(population_projects)

    @classmethod
    def get_population_stats(cls, population_projects: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
        if cls._cached_pop_stats is None or len(population_projects) != cls._pop_size:
            cls._cached_pop_stats = StatisticalAnomalyDetector.evaluate_population(population_projects)
            cls._pop_size = len(population_projects)
        return cls._cached_pop_stats

    @classmethod
    def evaluate_project(
        cls,
        target_project: Dict[str, Any],
        population_projects: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        
        # 1. Rule Engine Signals
        rule_findings = RuleEngine.evaluate_project(target_project)

        # 2. Statistical Z-Score Signals
        stat_findings = []
        if population_projects:
            cls.train_ml_model_if_needed(population_projects)
            pop_stats = cls.get_population_stats(population_projects)
            stat_findings = StatisticalAnomalyDetector.evaluate_project(target_project, pop_stats)

        # 3. Isolation Forest ML Output
        ml_detector = cls.get_ml_detector()
        ml_result = ml_detector.predict_anomaly(target_project)

        # 4. 6-Factor Weighted Trust Score Calculation
        trust_breakdown = TrustScoreEngine.calculate_trust_score(target_project)
        trust_score = trust_breakdown["overall_trust_score"]

        # 5. Signal Count Aggregation (Consistent & Discrepancy-Free)
        rule_count = len(rule_findings)
        stat_count = len(stat_findings)
        is_ml_outlier = ml_result.get("is_outlier", False)
        ml_count = 1 if is_ml_outlier else 0

        total_signals_count = rule_count + stat_count + ml_count

        # Priority determination
        high_count = sum(1 for f in rule_findings if f.get("severity") == "HIGH_PRIORITY") + \
                     sum(1 for f in stat_findings if f.get("severity") == "HIGH_PRIORITY")

        if trust_score < 70.0 or high_count > 0 or is_ml_outlier:
            verification_priority = "HIGH_PRIORITY"
        elif trust_score < 85.0 or (rule_count + stat_count) > 0:
            verification_priority = "ATTENTION"
        else:
            verification_priority = "NORMAL"

        # Multi-Factor Radar breakdown
        combined_findings = list(rule_findings) + list(stat_findings)
        radar_factors = {
            "Financial": "High Priority" if any(f.get("reason_code") in ["EXPENDITURE_OVER_SANCTION", "PROGRESS_MISMATCH", "STATISTICAL_COST_OUTLIER"] for f in combined_findings) else "Normal",
            "Timeline": "Normal",
            "Evidence": "Attention" if any(f.get("reason_code") == "EVIDENCE_GAP" for f in combined_findings) else "Normal",
            "Documents": "Normal",
            "Progress": "Attention" if any(f.get("reason_code") in ["STALE_UPDATE", "STATISTICAL_PROGRESS_GAP_OUTLIER"] for f in combined_findings) else "Normal",
            "Geospatial": "Attention" if any(f.get("reason_code") == "MISSING_LOCATION" for f in combined_findings) else "Normal",
            "Peer Benchmark": "Attention" if any(f.get("reason_code") == "STATISTICAL_PEER_RATIO_OUTLIER" for f in combined_findings) else "Normal",
            "ML Anomaly Detector": "High Priority" if is_ml_outlier else "Normal"
        }

        # Structured "WHY WAS THIS PROJECT FLAGGED?" Explanation Bullets
        explanation_bullets = []
        for rf in rule_findings:
            explanation_bullets.append(rf.get("explanation"))
        for sf in stat_findings:
            explanation_bullets.append(sf.get("explanation"))
        if is_ml_outlier:
            explanation_bullets.append(f"Isolation Forest ML classified project as an anomalous outlier (score = {ml_result.get('anomaly_score')}).")

        if not explanation_bullets:
            explanation_bullets.append("Project indicators align with standard progress parameters across sector peer benchmarks.")

        return {
            "project_id": str(target_project.get("id", target_project.get("project_code"))),
            "project_code": str(target_project.get("project_code", target_project.get("id"))),
            "trust_score": trust_score,
            "trust_breakdown": trust_breakdown,
            "verification_assessment": "Requires Verification" if trust_score < 80.0 else "Normal",
            "verification_priority": verification_priority,
            "rule_signals_count": rule_count,
            "statistical_signals_count": stat_count,
            "ml_signals_count": ml_count,
            "total_signals_count": total_signals_count,
            "ml_anomaly_detector": {
                "status": ml_result.get("status"),
                "is_outlier": is_ml_outlier,
                "ml_anomaly_label": ml_result.get("ml_anomaly_label", "UNKNOWN"),
                "ml_anomaly_score": ml_result.get("anomaly_score"),
                "raw_decision_score": ml_result.get("raw_decision_score"),
                "model_version": ml_result.get("model_version")
            },
            "findings": combined_findings,
            "radar_factors": radar_factors,
            "explanation_headline": f"Project requires attention: {total_signals_count} combined signal{'s' if total_signals_count!=1 else ''} detected.",
            "explanation_bullets": explanation_bullets,
            "recommended_action": "Inspect physical progress at project site and review supporting financial disbursement records.",
            "disclaimer": "AI decision-support analysis for verification prioritization. Confirm against official records before administrative action.",
            "generated_at": datetime.now().isoformat()
        }
