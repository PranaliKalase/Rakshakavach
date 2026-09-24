from typing import Dict, Any, List

class TrustScoreEngine:
    """
    Computes RAKSHKAVACH 6-Factor Weighted Trust Score (0.0 to 100.0):
      - Financial        25% (0.25)
      - Timeline         15% (0.15)
      - Evidence         20% (0.20)
      - Documents        15% (0.15)
      - Peer Benchmark   15% (0.15)
      - Geospatial       10% (0.10)
      
    Ensures absolute mathematical equality:
      overall_trust_score == sum(weighted_contributions)
    """

    WEIGHTS = {
        "financial": 0.25,
        "timeline": 0.15,
        "evidence": 0.20,
        "documents": 0.15,
        "peer": 0.15,
        "geospatial": 0.10
    }

    @classmethod
    def calculate_trust_score(cls, project: Dict[str, Any]) -> Dict[str, Any]:
        fin_prog = float(project.get("financialProgress", project.get("financial_progress", 0.0)))
        phys_prog = float(project.get("physicalProgress", project.get("physical_progress", 0.0)))
        sanctioned = float(project.get("sanctionedCost", project.get("sanctioned_cost", project.get("allocatedAmount", 0.0))))
        actual_exp = float(project.get("actualExpenditure", project.get("actual_expenditure", 0.0)))
        feats = project.get("ai_features", {})

        # 1. Financial Score (25% Weight)
        gap = fin_prog - phys_prog
        gap_penalty = 1.5 * (gap - 25.0) if gap > 25.0 else 0.0
        overrun_penalty = 0.0
        if actual_exp > sanctioned and sanctioned > 0:
            overrun_penalty = min(50.0, ((actual_exp - sanctioned) / sanctioned) * 100.0)

        financial_score = round(max(0.0, 100.0 - gap_penalty - overrun_penalty), 2)

        # 2. Timeline Score (15% Weight)
        timeline_score = 100.0
        if project.get("is_stale", False):
            timeline_score -= 30.0
        if phys_prog == 0.0 and fin_prog > 20.0:
            timeline_score -= 30.0
        timeline_score = round(max(0.0, timeline_score), 2)

        # 3. Evidence Score (20% Weight)
        ev_count = int(project.get("evidence_count", len(project.get("evidence_files", []))))
        if phys_prog >= 30.0 and ev_count == 0:
            evidence_score = 30.0
        elif ev_count == 0:
            evidence_score = 60.0
        else:
            evidence_score = 100.0
        evidence_score = round(evidence_score, 2)

        # 4. Document Score (15% Weight)
        doc_count = int(project.get("document_count", len(project.get("documents", []))))
        document_score = 100.0 if doc_count > 0 else 50.0

        # 5. Peer Benchmark Score (15% Weight)
        peer_ratio = float(feats.get("peer_cost_ratio", 1.0))
        if peer_ratio <= 1.2:
            peer_score = 100.0
        elif peer_ratio <= 2.0:
            peer_score = max(40.0, 100.0 - (peer_ratio - 1.2) * 50.0)
        else:
            peer_score = max(10.0, 60.0 - (peer_ratio - 2.0) * 20.0)
        peer_score = round(peer_score, 2)

        # 6. Geospatial Score (10% Weight)
        lat = project.get("latitude")
        lng = project.get("longitude")
        if lat is not None and lng is not None:
            geospatial_score = 100.0
        else:
            geospatial_score = 40.0

        # Exact Weighted Contributions
        fin_contrib = round(financial_score * cls.WEIGHTS["financial"], 2)
        time_contrib = round(timeline_score * cls.WEIGHTS["timeline"], 2)
        ev_contrib = round(evidence_score * cls.WEIGHTS["evidence"], 2)
        doc_contrib = round(document_score * cls.WEIGHTS["documents"], 2)
        peer_contrib = round(peer_score * cls.WEIGHTS["peer"], 2)
        geo_contrib = round(geospatial_score * cls.WEIGHTS["geospatial"], 2)

        # Overall Trust Score (Exact Sum of Contributions)
        overall_score = round(fin_contrib + time_contrib + ev_contrib + doc_contrib + peer_contrib + geo_contrib, 2)

        # Main concerns
        concerns = []
        if financial_score < 70.0:
            concerns.append(f"Financial progress ({fin_prog}%) significantly leads physical progress ({phys_prog}%)")
        if timeline_score < 70.0:
            concerns.append("Timeline update staleness or zero physical progress")
        if evidence_score < 70.0:
            concerns.append("Visual evidence gap for advanced physical execution")
        if document_score < 70.0:
            concerns.append("Missing official sanction PDF documentation")
        if peer_score < 70.0:
            concerns.append("Sanctioned cost exceeds sector peer benchmark average")
        if geospatial_score < 70.0:
            concerns.append("Unverified or missing GPS geographic coordinates")

        return {
            "overall_trust_score": overall_score,
            "financial_score": financial_score,
            "financial_weight": cls.WEIGHTS["financial"],
            "financial_contribution": fin_contrib,
            "timeline_score": timeline_score,
            "timeline_weight": cls.WEIGHTS["timeline"],
            "timeline_contribution": time_contrib,
            "evidence_score": evidence_score,
            "evidence_weight": cls.WEIGHTS["evidence"],
            "evidence_contribution": ev_contrib,
            "document_score": document_score,
            "document_weight": cls.WEIGHTS["documents"],
            "document_contribution": doc_contrib,
            "peer_score": peer_score,
            "peer_weight": cls.WEIGHTS["peer"],
            "peer_contribution": peer_contrib,
            "geospatial_score": geospatial_score,
            "geospatial_weight": cls.WEIGHTS["geospatial"],
            "geospatial_contribution": geo_contrib,
            "weights": cls.WEIGHTS,
            "weighted_contributions": {
                "financial": fin_contrib,
                "timeline": time_contrib,
                "evidence": ev_contrib,
                "documents": doc_contrib,
                "peer": peer_contrib,
                "geospatial": geo_contrib
            },
            "main_concerns": concerns
        }
