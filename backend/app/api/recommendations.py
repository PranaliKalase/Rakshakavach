from fastapi import APIRouter, HTTPException, Query, Response, Header
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["MP Work Recommendations"])

class RecommendationCreateRequest(BaseModel):
    project_title: str
    project_description: Optional[str] = ""
    sector: str
    estimated_cost: float
    village: Optional[str] = ""
    taluka: Optional[str] = ""
    district: Optional[str] = "D007"
    state: Optional[str] = "Maharashtra"
    constituency_id: Optional[str] = "C001"
    constituency_name: Optional[str] = "Maharashtra Demo Parliamentary Constituency 13"
    recommended_by_user_id: Optional[str] = None
    recommended_by_name: Optional[str] = None
    recommended_by_role: Optional[str] = "MP"
    mp_id: Optional[str] = None
    mp_name: Optional[str] = None
    priority: Optional[str] = "MEDIUM"
    justification: Optional[str] = ""
    expected_beneficiaries: Optional[str] = "Local residents"

class RecommendationStatusUpdateRequest(BaseModel):
    status: str
    performed_by: Optional[str] = "District Authority Officer"
    performed_role: Optional[str] = "DISTRICT_AUTHORITY"
    remarks: Optional[str] = None

class RecommendationApproveRequest(BaseModel):
    performed_by: Optional[str] = "District Authority Officer"
    performed_role: Optional[str] = "DISTRICT_AUTHORITY"
    agency_id: Optional[str] = "IA011"
    remarks: Optional[str] = "Approved by District Authority after technical evaluation."

@router.post("")
def create_recommendation(
    req: RecommendationCreateRequest,
    x_user_role: Optional[str] = Header("MP", alias="X-User-Role")
):
    """
    RBAC Protected: Only MPs can submit new work recommendations.
    Automatically logs submission audit entry and persists to database.
    """
    # Strict RBAC enforcement: X-User-Role header takes precedence for security enforcement
    active_role = (x_user_role or req.recommended_by_role or "MP").upper()
    if active_role != "MP":
        raise HTTPException(
            status_code=403,
            detail="Security Violation: Only Members of Parliament (MP) are authorized to create work recommendations."
        )

    rec_data = req.dict()
    new_rec = RecommendationService.create_recommendation(rec_data)
    return Response(content=json.dumps(new_rec, default=str), media_type="application/json", status_code=201)

@router.get("")
def list_recommendations(
    mp_name: Optional[str] = Query(None, description="Filter by MP Name"),
    district: Optional[str] = Query(None, description="Filter by District ID or Name"),
    status: Optional[str] = Query(None, description="Filter by Recommendation Status"),
    role: Optional[str] = Query(None, description="Filter by Active Role Context")
):
    """
    List recommendations filtered dynamically by MP, District, Status, or Role.
    """
    recs = RecommendationService.get_recommendations(
        mp_name=mp_name,
        district=district,
        status=status,
        role=role
    )
    return Response(content=json.dumps(recs, default=str), media_type="application/json")

@router.get("/summary")
def get_recommendations_summary():
    """
    Summary analytics for Admin & Executive Dashboards:
    Total count, distribution by MP, distribution by district, status breakdown.
    """
    summary = RecommendationService.get_recommendations_summary()
    return Response(content=json.dumps(summary, default=str), media_type="application/json")

@router.get("/{recommendation_id}")
def get_recommendation_details(recommendation_id: str):
    """
    Get detailed recommendation record along with full governance audit history.
    """
    rec = RecommendationService.get_recommendation_by_id(recommendation_id)
    if not rec:
        raise HTTPException(status_code=404, detail=f"Recommendation '{recommendation_id}' not found.")

    audit_logs = RecommendationService.get_audit_logs(entity_id=recommendation_id)
    result = {
        "recommendation": rec,
        "audit_logs": audit_logs
    }
    return Response(content=json.dumps(result, default=str), media_type="application/json")

@router.put("/{recommendation_id}/status")
def update_recommendation_status(
    recommendation_id: str,
    req: RecommendationStatusUpdateRequest,
    x_user_role: Optional[str] = Header("DISTRICT_AUTHORITY", alias="X-User-Role")
):
    """
    RBAC Protected: District Authority / Admin / Authorized roles update workflow status.
    If status is updated to SANCTIONED, automatically converts recommendation into a Project record.
    """
    role = (x_user_role or req.performed_role or "DISTRICT_AUTHORITY").upper()
    if role not in ["DISTRICT_AUTHORITY", "ADMIN", "MONITORING_OFFICER"]:
        raise HTTPException(
            status_code=403,
            detail="Security Violation: Only District Authority or Admin roles can update recommendation status."
        )

    try:
        updated = RecommendationService.update_recommendation_status(
            rec_id=recommendation_id,
            new_status=req.status,
            performed_by=req.performed_by or "District Authority",
            performed_role=role,
            remarks=req.remarks
        )
        return Response(content=json.dumps(updated, default=str), media_type="application/json")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{recommendation_id}/approve")
def approve_recommendation(
    recommendation_id: str,
    req: RecommendationApproveRequest,
    x_user_role: Optional[str] = Header("DISTRICT_AUTHORITY", alias="X-User-Role")
):
    """
    RBAC Protected: Direct approval of recommendation by District Authority.
    Updates status to SANCTIONED, creates linked project record, and logs audit trail.
    """
    role = (x_user_role or req.performed_role or "DISTRICT_AUTHORITY").upper()
    if role not in ["DISTRICT_AUTHORITY", "ADMIN"]:
        raise HTTPException(
            status_code=403,
            detail="Security Violation: District Authority approval required."
        )

    try:
        result = RecommendationService.update_recommendation_status(
            rec_id=recommendation_id,
            new_status="SANCTIONED",
            performed_by=req.performed_by or "District Authority Officer",
            performed_role=role,
            remarks=req.remarks
        )
        return Response(content=json.dumps(result, default=str), media_type="application/json")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{recommendation_id}/audit")
def get_recommendation_audit_logs(recommendation_id: str):
    """
    Retrieve governance audit history for a specific recommendation.
    """
    logs = RecommendationService.get_audit_logs(entity_id=recommendation_id)
    return Response(content=json.dumps(logs, default=str), media_type="application/json")
