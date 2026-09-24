import uuid
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Query, Response
from typing import List, Optional
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectSanctionRequest, ProjectAssignRequest, ProgressUpdateRequest
from app.services.data_loader import DataLoaderService
from app.services.supabase_client import SupabaseClientService

router = APIRouter()

@router.get("/projects")
def get_projects(
    role: Optional[str] = Query(None, description="Logged in role: MP, DISTRICT_AUTHORITY, MONITORING_OFFICER, IMPLEMENTING_AGENCY, ADMIN"),
    mp_name: Optional[str] = Query(None, description="Hon'ble MP name filter"),
    district_id: Optional[str] = Query(None, description="District ID filter"),
    agency_id: Optional[str] = Query(None, description="Implementing agency ID filter"),
    status: Optional[str] = Query(None, description="Project status filter"),
    sector: Optional[str] = Query(None, description="Sector filter"),
    priority: Optional[str] = Query(None, description="Priority filter"),
    search: Optional[str] = Query(None, description="Search query string"),
    limit: int = Query(500, ge=1, le=500),
    provenance: Optional[str] = None
):
    projects = DataLoaderService.get_projects_filtered(
        role=role,
        mp_name=mp_name,
        district_id=district_id,
        agency_id=agency_id,
        status=status,
        sector=sector,
        priority=priority,
        search=search,
        limit=limit
    )

    if provenance:
        projects = [p for p in projects if p.get("provenance") == provenance]

    return Response(content=json.dumps(projects, default=str), media_type="application/json")

@router.get("/mp/summary")
def get_mp_summary(mp_name: str = Query("Demo MP 013", description="Hon'ble MP name")):
    summary = DataLoaderService.get_mp_summary(mp_name)
    return Response(content=json.dumps(summary, default=str), media_type="application/json")

@router.get("/mp/list")
def get_mp_list():
    mp_list = DataLoaderService.get_mp_list()
    return Response(content=json.dumps(mp_list, default=str), media_type="application/json")

@router.get("/projects/validation-report")
def get_validation_report():
    report = DataLoaderService.get_validation_report()
    return report.to_dict()

@router.post("/projects", status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate):
    new_id = str(uuid.uuid4())
    code_suffix = new_id[:6].upper()
    project_code = f"MPLADS-2026-{code_suffix}"
    now_iso = datetime.now().isoformat()

    mp_name = payload.mp_name or "Demo MP 013"
    alloc_id = payload.allocation_id or f"ALLOC-NEW-{code_suffix}"

    new_project = {
        "id": new_id,
        "project_id": new_id,
        "project_code": project_code,
        "work_name": payload.work_name,
        "description": payload.description or f"MP Recommended Work: {payload.work_name}",
        "mp_name": mp_name,
        "allocation_id": alloc_id,
        "district_id": payload.district_id,
        "district_name": f"District {payload.district_id}",
        "constituency_id": payload.constituency_id,
        "constituency_name": f"Constituency {payload.constituency_id}",
        "agency_id": None,
        "agency_name": "Pending Allocation",
        "sector": payload.sector,
        "allocated_amount": payload.estimated_cost,
        "estimated_cost": payload.estimated_cost,
        "sanctioned_amount": 0.0,
        "sanctioned_cost": 0.0,
        "actual_expenditure": 0.0,
        "expenditure": 0.0,
        "physical_progress": 0.0,
        "financial_progress": 0.0,
        "status": "RECOMMENDED_BY_MP",
        "priority": "NORMAL",
        "verification_priority": "NORMAL",
        "trust_score": 100.0,
        "explanation": "Newly submitted MP recommendation awaiting District Authority review.",
        "latitude": payload.latitude or 21.3554,
        "longitude": payload.longitude or 72.7368,
        "provenance": "OFFICIAL",
        "created_at": now_iso,
        "updated_at": now_iso,
        "financials": {
            "sanctioned_cost": 0.0,
            "actual_expenditure": 0.0,
            "allocated_amount": payload.estimated_cost,
            "provenance": "OFFICIAL"
        },
        "progress": {
            "physical_progress": 0.0,
            "financial_progress": 0.0,
            "provenance": "OFFICIAL"
        },
        "payments": [],
        "evidence_files": [],
        "documents": [],
        "inspections": [],
        "risk_factors": []
    }

    # Add to memory cache
    cached = DataLoaderService.load_dataset()
    cached.insert(0, new_project)
    DataLoaderService._cached_index[new_id] = new_project
    DataLoaderService._cached_index[project_code] = new_project

    # Sync to Supabase if configured
    try:
        SupabaseClientService.upsert_projects([new_project])
    except Exception as e:
        print(f"Supabase upsert warning on creation: {e}")

    return Response(content=json.dumps(new_project, default=str), media_type="application/json", status_code=201)

@router.get("/projects/{project_id}")
def get_project_by_id(project_id: str):
    proj = DataLoaderService.get_project_by_id(project_id)
    if proj:
        return Response(content=json.dumps(proj, default=str), media_type="application/json")

    supabase_proj = SupabaseClientService.fetch_project_by_id(project_id)
    if supabase_proj:
        return Response(content=json.dumps(supabase_proj, default=str), media_type="application/json")

    raise HTTPException(status_code=404, detail="Project not found")

@router.get("/projects/{project_id}/relational")
def get_project_full_relational(project_id: str):
    relational_data = DataLoaderService.get_project_full_relational(project_id)
    if relational_data:
        return Response(content=json.dumps(relational_data, default=str), media_type="application/json")

    sp_rel = SupabaseClientService.fetch_project_full_relational(project_id)
    if sp_rel:
        return Response(content=json.dumps(sp_rel, default=str), media_type="application/json")

    raise HTTPException(status_code=404, detail="Project not found")

@router.post("/projects/{project_id}/sanction")
def sanction_project(project_id: str, req: ProjectSanctionRequest):
    proj = DataLoaderService.get_project_by_id(project_id)
    if proj:
        proj["status"] = "SANCTIONED"
        proj["sanctioned_cost"] = req.sanctioned_cost
        proj["sanctioned_amount"] = req.sanctioned_cost
        return {"status": "success", "message": "Project sanctioned successfully", "project": proj}

    raise HTTPException(status_code=404, detail="Project not found")

@router.post("/projects/{project_id}/assign")
def assign_agency(project_id: str, req: ProjectAssignRequest):
    proj = DataLoaderService.get_project_by_id(project_id)
    if proj:
        proj["status"] = "ASSIGNED"
        proj["agency_id"] = req.agency_id
        return {"status": "success", "message": "Agency assigned successfully", "project": proj}

    raise HTTPException(status_code=404, detail="Project not found")
