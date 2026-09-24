import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.services.data_loader import DataLoaderService
from app.ml.multi_factor_engine import MultiFactorAnomalyEngine

class GovernanceWorkflowService:
    """
    Service managing the human-in-the-loop Governance Workflow:
    Verification Queue -> Field Inspection Submission -> District Authority Review -> Final Decision -> Audit Logging.
    """

    _audit_logs: List[Dict[str, Any]] = []
    _cached_queue: Optional[List[Dict[str, Any]]] = None

    # Standardized Governance Decisions -> Project Status Mapping
    DECISION_STATUS_MAP = {
        "APPROVED": "SANCTIONED",
        "SANCTIONED": "SANCTIONED",
        "VERIFIED": "VERIFIED",
        "CLARIFICATION_REQUIRED": "CLARIFICATION_REQUIRED",
        "REJECTED": "REJECTED",
        "COMPLETED": "COMPLETED"
    }

    @classmethod
    def get_verification_queue(cls, limit: int = 500) -> List[Dict[str, Any]]:
        if cls._cached_queue is not None:
            return cls._cached_queue[:limit]

        projects = DataLoaderService.load_dataset()
        MultiFactorAnomalyEngine.train_ml_model_if_needed(projects)

        queue = []
        for p in projects:
            assessment = MultiFactorAnomalyEngine.evaluate_project(p, projects)
            ml_info = assessment.get("ml_anomaly_detector", {})

            queue.append({
                "id": p["id"],
                "project_code": p["project_code"],
                "work_name": p["work_name"],
                "sector": p["sector"],
                "district_id": p.get("district_id"),
                "physical_progress": p["physical_progress"],
                "financial_progress": p["financial_progress"],
                "sanctioned_cost": p["sanctioned_cost"],
                "trust_score": assessment["trust_score"],
                "trust_breakdown": assessment.get("trust_breakdown", {}),
                "verification_priority": assessment["verification_priority"],
                "verification_assessment": assessment["verification_assessment"],
                "ml_anomaly_score": ml_info.get("ml_anomaly_score", 0.0),
                "ml_anomaly_label": ml_info.get("ml_anomaly_label", "NORMAL"),
                "is_ml_outlier": ml_info.get("is_outlier", False),
                "rule_signals_count": assessment.get("rule_signals_count", 0),
                "statistical_signals_count": assessment.get("statistical_signals_count", 0),
                "ml_signals_count": assessment.get("ml_signals_count", 0),
                "total_signals_count": assessment.get("total_signals_count", 0),
                "explanation_headline": assessment.get("explanation_headline"),
                "explanation_bullets": assessment.get("explanation_bullets", []),
                "recommended_action": assessment.get("recommended_action"),
                "findings": assessment.get("findings", []),
                "status": p.get("status", "IN_PROGRESS"),
                "provenance": p.get("provenance", "OFFICIAL")
            })

        # Priority ordering: HIGH_PRIORITY first, then ATTENTION, then NORMAL; sorted by lowest trust_score
        priority_weight = {"HIGH_PRIORITY": 0, "ATTENTION": 1, "NORMAL": 2}
        queue.sort(key=lambda x: (priority_weight.get(x["verification_priority"], 3), x["trust_score"]))
        cls._cached_queue = queue

        return cls._cached_queue[:limit]

    @classmethod
    def submit_inspection(
        cls,
        project_id: str,
        officer_id: str,
        actual_physical_progress: float,
        observed_condition: str,
        is_location_verified: bool,
        verification_outcome: str,
        officer_remarks: str
    ) -> Dict[str, Any]:
        proj = DataLoaderService.get_project_by_id(project_id)
        if not proj:
            raise ValueError(f"Project '{project_id}' not found.")

        inspection_id = str(uuid.uuid4())
        inspection_code = f"INSP-{proj['project_code']}-{len(proj.get('inspections', []))+1:02d}"

        inspection_record = {
            "id": inspection_id,
            "inspection_code": inspection_code,
            "project_id": proj["id"],
            "assigned_officer_id": officer_id,
            "actual_physical_progress": actual_physical_progress,
            "observed_condition": observed_condition,
            "is_location_verified": is_location_verified,
            "verification_outcome": verification_outcome,
            "officer_remarks": officer_remarks,
            "inspection_date": datetime.now().strftime("%Y-%m-%d"),
            "created_at": datetime.now().isoformat(),
            "provenance": "SYNTHETIC DEMO DATA"
        }

        # Attach to project & update status
        if "inspections" not in proj:
            proj["inspections"] = []
        proj["inspections"].append(inspection_record)
        proj["status"] = "VERIFIED" if verification_outcome == "VERIFIED" else "VERIFICATION_PENDING"
        cls._cached_queue = None

        # Record Audit Log
        audit_entry = {
            "id": str(uuid.uuid4()),
            "project_id": proj["id"],
            "project_code": proj["project_code"],
            "user_id": officer_id,
            "user_role": "MONITORING_OFFICER",
            "action": "SUBMIT_FIELD_INSPECTION",
            "entity_name": "field_inspections",
            "entity_id": inspection_id,
            "verification_status": proj["status"],
            "remarks": f"Field inspection submitted by Monitoring Officer. Progress observed: {actual_physical_progress}%. Outcome: {verification_outcome}.",
            "created_at": datetime.now().isoformat()
        }
        cls._audit_logs.append(audit_entry)

        return {
            "status": "success",
            "message": "Field inspection submitted successfully.",
            "inspection": inspection_record,
            "audit_log": audit_entry
        }

    @classmethod
    def record_authority_decision(
        cls,
        project_id: str,
        authority_id: str,
        decision: str,
        remarks: str
    ) -> Dict[str, Any]:
        proj = DataLoaderService.get_project_by_id(project_id)
        if not proj:
            raise ValueError(f"Project '{project_id}' not found.")

        previous_status = proj.get("status", "IN_PROGRESS")
        new_status = cls.DECISION_STATUS_MAP.get(decision.upper(), decision.upper())

        proj["status"] = new_status
        proj["updated_at"] = datetime.now().isoformat()

        # Record Audit Log
        audit_entry = {
            "id": str(uuid.uuid4()),
            "project_id": proj["id"],
            "project_code": proj["project_code"],
            "user_id": authority_id,
            "user_role": "DISTRICT_AUTHORITY",
            "action": "RECORD_GOVERNANCE_DECISION",
            "entity_name": "projects",
            "entity_id": proj["id"],
            "previous_state": {"status": previous_status},
            "new_state": {"status": new_status},
            "final_decision": decision,
            "remarks": remarks,
            "created_at": datetime.now().isoformat()
        }
        cls._audit_logs.append(audit_entry)

        return {
            "status": "success",
            "message": f"District Authority decision '{decision}' recorded successfully.",
            "project_id": proj["id"],
            "previous_status": previous_status,
            "new_status": new_status,
            "audit_log": audit_entry
        }

    @classmethod
    def get_audit_logs(cls, limit: int = 50) -> List[Dict[str, Any]]:
        return sorted(cls._audit_logs, key=lambda x: x["created_at"], reverse=True)[:limit]
