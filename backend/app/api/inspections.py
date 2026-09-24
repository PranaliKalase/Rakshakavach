from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.workflow_service import GovernanceWorkflowService

router = APIRouter()

class FieldInspectionRequest(BaseModel):
    officer_id: str = "usr-mo-official"
    actual_physical_progress: float = Field(..., ge=0.0, le=100.0)
    observed_condition: str
    is_location_verified: bool = True
    verification_outcome: str = "VERIFIED" # 'VERIFIED', 'REQUIRES_FURTHER_EVIDENCE', 'ESCALATED'
    officer_remarks: str

class GovernanceDecisionRequest(BaseModel):
    authority_id: str = "usr-da-official"
    decision: str # 'SANCTIONED', 'VERIFIED', 'CLARIFICATION_REQUIRED', 'REJECTED', 'COMPLETED'
    remarks: str

@router.get("/verification-queue")
def get_verification_queue(limit: int = Query(50, ge=1, le=500)):
    queue = GovernanceWorkflowService.get_verification_queue(limit=limit)
    return queue

@router.post("/projects/{project_id}/inspections", status_code=status.HTTP_201_CREATED)
def submit_field_inspection(project_id: str, req: FieldInspectionRequest):
    try:
        res = GovernanceWorkflowService.submit_inspection(
            project_id=project_id,
            officer_id=req.officer_id,
            actual_physical_progress=req.actual_physical_progress,
            observed_condition=req.observed_condition,
            is_location_verified=req.is_location_verified,
            verification_outcome=req.verification_outcome,
            officer_remarks=req.officer_remarks
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/projects/{project_id}/decision")
def record_governance_decision(project_id: str, req: GovernanceDecisionRequest):
    try:
        res = GovernanceWorkflowService.record_authority_decision(
            project_id=project_id,
            authority_id=req.authority_id,
            decision=req.decision,
            remarks=req.remarks
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/audit-logs")
def get_audit_logs(limit: int = Query(50, ge=1, le=500)):
    logs = GovernanceWorkflowService.get_audit_logs(limit=limit)
    return logs
