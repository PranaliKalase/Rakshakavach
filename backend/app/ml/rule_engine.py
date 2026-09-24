from typing import List, Dict, Any

class RuleEngine:
    """
    Deterministic governance rule engine for MPLADS project verification.
    NEVER uses terms like "Fraud Detected". Uses strict review signal terminology.
    """

    @staticmethod
    def evaluate_project(project: Dict[str, Any]) -> List[Dict[str, Any]]:
        findings = []

        physical = float(project.get("physical_progress", 0.0))
        financial = float(project.get("financial_progress", 0.0))
        actual_exp = float(project.get("actual_expenditure", 0.0))
        sanctioned = float(project.get("sanctioned_cost", project.get("estimated_cost", 0.0)))
        evidence_count = int(project.get("evidence_count", 0))
        lat = project.get("latitude")
        lng = project.get("longitude")

        # Rule 1: Financial progress substantially ahead of physical progress
        if financial > (physical + 25.0) and physical < 90.0:
            findings.append({
                "reason_code": "PROGRESS_MISMATCH",
                "severity": "HIGH_PRIORITY",
                "explanation": f"Reported financial progress ({financial}%) significantly leads reported physical completion ({physical}%).",
                "affected_field": "financial_progress",
                "recommended_action": "Conduct site inspection to verify actual physical progress against reported expenditure."
            })

        # Rule 2: Financial expenditure exceeds sanctioned budget
        if actual_exp > sanctioned and sanctioned > 0:
            findings.append({
                "reason_code": "EXPENDITURE_OVER_SANCTION",
                "severity": "HIGH_PRIORITY",
                "explanation": f"Actual expenditure (₹{actual_exp:,.2f}) exceeds sanctioned cost (₹{sanctioned:,.2f}).",
                "affected_field": "actual_expenditure",
                "recommended_action": "Review budget approval and sanction revision documentation."
            })

        # Rule 3: Evidence gap for advanced execution
        if physical >= 30.0 and evidence_count == 0:
            findings.append({
                "reason_code": "EVIDENCE_GAP",
                "severity": "ATTENTION",
                "explanation": f"Project physical progress is reported at {physical}%, but zero visual evidence files are uploaded.",
                "affected_field": "evidence_files",
                "recommended_action": "Request Implementing Agency to upload geo-tagged site progress photographs."
            })

        # Rule 4: Missing location coordinates
        if lat is None or lng is None:
            findings.append({
                "reason_code": "MISSING_LOCATION",
                "severity": "ATTENTION",
                "explanation": "Project coordinates are not recorded in official record.",
                "affected_field": "latitude_longitude",
                "recommended_action": "Record verified physical coordinates during next field verification."
            })

        # Rule 5: Stale update on active projects
        if project.get("is_stale", False):
            findings.append({
                "reason_code": "STALE_UPDATE",
                "severity": "ATTENTION",
                "explanation": "No progress update received in over 90 days.",
                "affected_field": "updated_at",
                "recommended_action": "Send progress update reminder to Implementing Agency."
            })

        return findings
