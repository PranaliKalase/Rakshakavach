from typing import Dict, Any, List, Optional
import math
from datetime import datetime

class FeatureEngineeringService:
    """
    Calculates dynamic structured AI features from raw project and child entity data.
    Computes mathematical indicators without copying static hardcoded values.
    """

    SECTOR_PEER_AVG_COSTS = {
        "Rural Electrification": 2500000.0,
        "Community Skill Centers & Libraries": 150000000.0,
        "Education & Skill Development": 120000000.0,
        "Healthcare & Drinking Water": 100000000.0,
        "Roads & Infrastructure": 200000000.0,
        "DEFAULT": 100000000.0
    }

    @classmethod
    def extract_features(
        cls,
        project: Dict[str, Any],
        payments: Optional[List[Dict[str, Any]]] = None,
        evidence_files: Optional[List[Dict[str, Any]]] = None,
        documents: Optional[List[Dict[str, Any]]] = None,
        inspections: Optional[List[Dict[str, Any]]] = None,
        peer_benchmark_cost: Optional[float] = None
    ) -> Dict[str, Any]:
        
        # 1. Base progress & financial figures
        financial_prog = float(project.get("financialProgress", project.get("financial_progress", 0.0)))
        physical_prog = float(project.get("physicalProgress", project.get("physical_progress", 0.0)))
        sanctioned_amt = float(project.get("sanctionedCost", project.get("sanctioned_cost", project.get("allocatedAmount", 0.0))))
        actual_exp = float(project.get("actualExpenditure", project.get("actual_expenditure", 0.0)))

        # 2. Progress gap calculation
        progress_gap_pct = round(financial_prog - physical_prog, 2)

        # 3. Utilization & Cost variance percentages
        utilization_pct = round((actual_exp / sanctioned_amt * 100.0), 2) if sanctioned_amt > 0 else 0.0
        cost_variance_pct = round(((actual_exp - sanctioned_amt) / sanctioned_amt * 100.0), 2) if sanctioned_amt > 0 else 0.0

        # 4. Project duration days calculation
        duration_days = int(project.get("duration_days", project.get("durationDays", 365)))
        start_date = project.get("created_at", project.get("sanction_date"))
        end_date = project.get("expected_completion_date")

        if start_date and end_date:
            try:
                d1 = datetime.fromisoformat(str(start_date).replace('Z', '')) if isinstance(start_date, str) else start_date
                d2 = datetime.fromisoformat(str(end_date).replace('Z', '')) if isinstance(end_date, str) else end_date
                duration_days = max(1, (d2 - d1).days)
            except Exception:
                pass

        # 5. Payments metrics (count and Herfindahl concentration)
        payment_list = payments or project.get("payments", [])
        payment_count = len(payment_list)
        payment_concentration = 0.0

        if payment_list:
            amounts = [float(p.get("amount", 0.0)) for p in payment_list]
            total_pay = sum(amounts)
            if total_pay > 0:
                # Herfindahl-Hirschman Index of payment shares
                payment_concentration = round(sum((a / total_pay) ** 2 for a in amounts), 4)

        # 6. Evidence, Document, Inspection counts
        ev_list = evidence_files or project.get("evidence_files", [])
        doc_list = documents or project.get("documents", [])
        insp_list = inspections or project.get("inspections", [])

        evidence_count = int(project.get("evidence_count", len(ev_list)))
        document_count = int(project.get("document_count", len(doc_list)))
        inspection_count = int(project.get("inspection_count", len(insp_list)))

        # 7. Peer cost ratio
        sector = project.get("sector", "DEFAULT")
        benchmark_cost = peer_benchmark_cost or cls.SECTOR_PEER_AVG_COSTS.get(sector, cls.SECTOR_PEER_AVG_COSTS["DEFAULT"])
        peer_cost_ratio = round(sanctioned_amt / benchmark_cost, 4) if benchmark_cost > 0 else 1.0

        # 8. GPS availability check
        lat = project.get("latitude")
        lng = project.get("longitude")
        gps_available = (lat is not None and lng is not None)

        return {
            "project_id": str(project.get("id", project.get("projectCode"))),
            "financial_progress": financial_prog,
            "physical_progress": physical_prog,
            "progress_gap_pct": progress_gap_pct,
            "sanctioned_amount": sanctioned_amt,
            "actual_expenditure": actual_exp,
            "utilization_pct": utilization_pct,
            "cost_variance_pct": cost_variance_pct,
            "project_duration_days": duration_days,
            "payment_count": payment_count,
            "payment_concentration": payment_concentration,
            "evidence_count": evidence_count,
            "document_count": document_count,
            "inspection_count": inspection_count,
            "peer_cost_ratio": peer_cost_ratio,
            "gps_available": gps_available,
            "calculated_at": datetime.now().isoformat()
        }
