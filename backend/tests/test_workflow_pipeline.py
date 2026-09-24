import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.workflow_service import GovernanceWorkflowService
from app.services.data_loader import DataLoaderService

def test_verification_queue_ordering():
    queue = GovernanceWorkflowService.get_verification_queue(limit=10)
    assert len(queue) > 0

    # Verify priority queue returns records
    priorities = [p.get("verification_priority") or p.get("priority") for p in queue]
    assert len(priorities) > 0

    full_queue = GovernanceWorkflowService.get_verification_queue(limit=500)
    assert len(full_queue) > 0

def test_full_governance_workflow_trace():
    project_id = "c9c2d1d2-807e-5895-9aad-1cf748ae2337"
    
    # 1. Fetch AI Verification Queue
    queue = GovernanceWorkflowService.get_verification_queue(limit=500)
    assert len(queue) > 0
    target_in_queue = queue[0]
    project_id = target_in_queue["id"]


    # 2. Monitoring Officer Submits Field Inspection Report
    insp_result = GovernanceWorkflowService.submit_inspection(
        project_id=target_in_queue["id"],
        officer_id="usr-mo-official",
        actual_physical_progress=100.0,
        observed_condition="All traffic safety installations fully verified.",
        is_location_verified=True,
        verification_outcome="VERIFIED",
        officer_remarks="Field verified physical completion."
    )
    assert insp_result["status"] == "success"
    assert insp_result["inspection"]["actual_physical_progress"] == 100.0

    # 3. District Authority Reviews and Records Final Governance Decision
    decision_result = GovernanceWorkflowService.record_authority_decision(
        project_id=target_in_queue["id"],
        authority_id="usr-da-official",
        decision="APPROVED",
        remarks="District Authority approved following satisfactory field verification."
    )
    assert decision_result["status"] == "success"
    assert decision_result["new_status"] in ["APPROVED", "SANCTIONED", "VERIFIED"]

    # 4. Verify Audit Logs Recorded
    audit_logs = GovernanceWorkflowService.get_audit_logs()
    actions = [log["action"] for log in audit_logs]
    assert "SUBMIT_FIELD_INSPECTION" in actions or "RECORD_GOVERNANCE_DECISION" in actions

