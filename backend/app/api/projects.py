import uuid
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Query, Response
from typing import List, Optional
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectSanctionRequest, ProjectAssignRequest, ProgressUpdateRequest, ProjectCompletionRequest
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
        SupabaseClientService.insert_governance_audit_log({
            "id": str(uuid.uuid4()),
            "project_id": new_id if len(new_id) == 36 else None,
            "entity_type": "PROJECT",
            "entity_id": new_id,
            "action": "RECOMMEND_WORK",
            "previous_state": {"status": "NONE"},
            "new_state": {"status": "RECOMMENDED_BY_MP", "work_name": payload.work_name},
            "performed_by_user_id": "usr-mp-official",
            "performed_by_name": mp_name,
            "performed_by_role": "MP",
            "state_name": "Maharashtra",
            "district_name": f"District {payload.district_id}",
            "constituency_name": f"Constituency {payload.constituency_id}",
            "created_at": now_iso
        })
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
        old_status = proj.get("status", "IN_PROGRESS")
        proj["status"] = "SANCTIONED"
        proj["sanctioned_cost"] = req.sanctioned_cost
        proj["sanctioned_amount"] = req.sanctioned_cost
        
        now_iso = datetime.now().isoformat()
        SupabaseClientService.insert_governance_decision({
            "id": str(uuid.uuid4()),
            "project_id": project_id if len(project_id) == 36 else None,
            "decision_type": "SANCTIONED",
            "decision_reason": f"Sanctioned cost set to ₹{req.sanctioned_cost}",
            "remarks": "Project sanctioned by District Authority",
            "previous_status": old_status,
            "new_status": "SANCTIONED",
            "decided_by_user_id": "usr-da-official",
            "decided_by_name": "District Collector / Nodal Officer",
            "decided_by_role": "DISTRICT_AUTHORITY",
            "created_at": now_iso
        })
        SupabaseClientService.insert_governance_audit_log({
            "id": str(uuid.uuid4()),
            "project_id": project_id if len(project_id) == 36 else None,
            "entity_type": "PROJECT",
            "entity_id": project_id,
            "action": "SANCTION_PROJECT",
            "previous_state": {"status": old_status},
            "new_state": {"status": "SANCTIONED", "sanctioned_cost": req.sanctioned_cost},
            "performed_by_user_id": "usr-da-official",
            "performed_by_name": "District Collector / Nodal Officer",
            "performed_by_role": "DISTRICT_AUTHORITY",
            "state_name": "Maharashtra",
            "district_name": proj.get("district_name", "Pune"),
            "constituency_name": proj.get("constituency_name", "Pune Constituency"),
            "created_at": now_iso
        })
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

@router.post("/projects/{project_id}/progress")
def update_project_progress(project_id: str, req: ProgressUpdateRequest):
    proj = DataLoaderService.get_project_by_id(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    old_phys = proj.get("physical_progress", 0.0)
    old_fin = proj.get("financial_progress", 0.0)
    now_iso = datetime.now().isoformat()

    proj["physical_progress"] = req.physical_progress
    proj["financial_progress"] = req.financial_progress
    proj["actual_expenditure"] = req.actual_expenditure
    proj["expenditure"] = req.actual_expenditure
    if req.milestone:
        proj["current_milestone"] = req.milestone
    if req.physical_progress >= 100:
        proj["status"] = "COMPLETED"
    elif proj["status"] in ["ASSIGNED", "SANCTIONED", "RECOMMENDED_BY_MP"]:
        proj["status"] = "IN_PROGRESS"

    proj["progress"] = {
        "physical_progress": req.physical_progress,
        "financial_progress": req.financial_progress,
        "provenance": "IMPLEMENTING_AGENCY_SUBMISSION",
        "updated_at": now_iso
    }

    # Record in audit history & Supabase
    update_uuid = str(uuid.uuid4())
    SupabaseClientService.insert_project_progress_update({
        "id": update_uuid,
        "project_id": project_id if len(project_id) == 36 else None,
        "physical_progress": req.physical_progress,
        "financial_progress": req.financial_progress,
        "remarks": req.remarks or "Physical & Financial progress updated",
        "updated_by_user_id": "usr-ia-official",
        "updated_by_name": "Implementing Agency Officer",
        "updated_by_role": "IMPLEMENTING_AGENCY",
        "created_at": now_iso
    })
    SupabaseClientService.insert_governance_audit_log({
        "id": str(uuid.uuid4()),
        "project_id": project_id if len(project_id) == 36 else None,
        "entity_type": "PROGRESS",
        "entity_id": update_uuid,
        "action": "UPDATE_PROGRESS",
        "previous_state": {"physical_progress": old_phys, "financial_progress": old_fin},
        "new_state": {"physical_progress": req.physical_progress, "financial_progress": req.financial_progress},
        "performed_by_user_id": "usr-ia-official",
        "performed_by_name": "Implementing Agency Officer",
        "performed_by_role": "IMPLEMENTING_AGENCY",
        "state_name": "Maharashtra",
        "district_name": proj.get("district_name", "Pune"),
        "constituency_name": proj.get("constituency_name", "Pune Constituency"),
        "created_at": now_iso
    })

    return {"status": "success", "message": "Progress updated successfully", "project": proj}

@router.post("/projects/{project_id}/evidence")
def submit_project_evidence(project_id: str, payload: dict):
    proj = DataLoaderService.get_project_by_id(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    if "evidence_files" not in proj or not isinstance(proj["evidence_files"], list):
        proj["evidence_files"] = []

    import hashlib
    now_str = datetime.now().isoformat()
    raw_hash_src = f"{project_id}-{now_str}-{payload.get('file_name', 'site_photo.jpg')}"
    sha_hash = hashlib.sha256(raw_hash_src.encode('utf-8')).hexdigest()
    evid_uuid = str(uuid.uuid4())

    evidence_item = {
        "id": evid_uuid,
        "evidence_id": f"EV-{now_str[:10]}-{len(proj['evidence_files'])+1:03d}",
        "project_id": project_id,
        "file_name": payload.get("file_name", "site_progress_photo.png"),
        "file_url": payload.get("file_url", f"https://rakshakavach.gov.in/evidence/{evid_uuid}"),
        "evidence_type": payload.get("evidence_type", "Progress Photograph"),
        "uploaded_by": payload.get("uploaded_by", "Implementing Agency Officer"),
        "uploaded_by_user_id": payload.get("uploaded_by_user_id", "usr-ia-official"),
        "uploaded_by_name": payload.get("uploaded_by", "Implementing Agency Officer"),
        "uploaded_by_role": payload.get("uploaded_by_role", "IMPLEMENTING_AGENCY"),
        "timestamp": now_str,
        "location": payload.get("location", "GPS Coordinates Verified (21.3554° N, 72.7368° E)"),
        "description": payload.get("description", "Routine physical milestone evidence photograph."),
        "hash": sha_hash,
        "status": "UNDER_REVIEW"
    }

    proj["evidence_files"].append(evidence_item)
    proj["evidence_count"] = len(proj["evidence_files"])

    # Persist to Supabase
    SupabaseClientService.insert_project_evidence({
        "id": evid_uuid,
        "project_id": project_id if len(project_id) == 36 else None,
        "file_name": evidence_item["file_name"],
        "file_url": evidence_item["file_url"],
        "file_type": evidence_item["evidence_type"],
        "uploaded_by_user_id": evidence_item["uploaded_by_user_id"],
        "uploaded_by_name": evidence_item["uploaded_by_name"],
        "uploaded_by_role": evidence_item["uploaded_by_role"],
        "created_at": now_str
    })
    SupabaseClientService.insert_governance_audit_log({
        "id": str(uuid.uuid4()),
        "project_id": project_id if len(project_id) == 36 else None,
        "entity_type": "EVIDENCE",
        "entity_id": evid_uuid,
        "action": "UPLOAD_EVIDENCE",
        "previous_state": {"evidence_count": proj["evidence_count"] - 1},
        "new_state": {"evidence_count": proj["evidence_count"], "file_name": evidence_item["file_name"]},
        "performed_by_user_id": evidence_item["uploaded_by_user_id"],
        "performed_by_name": evidence_item["uploaded_by_name"],
        "performed_by_role": evidence_item["uploaded_by_role"],
        "state_name": "Maharashtra",
        "district_name": proj.get("district_name", "Pune"),
        "constituency_name": proj.get("constituency_name", "Pune Constituency"),
        "created_at": now_str
    })

    return {"status": "success", "message": "Evidence recorded with SHA-256 hash", "evidence": evidence_item}

@router.post("/projects/{project_id}/inspections")
def submit_inspection(project_id: str, payload: dict):
    proj = DataLoaderService.get_project_by_id(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    now_str = datetime.now().isoformat()
    insp_uuid = str(uuid.uuid4())
    phys_prog = float(payload.get("actual_physical_progress", proj.get("physical_progress", 0.0)))
    notes = payload.get("officer_remarks") or payload.get("observed_condition") or "Field inspection completed"

    inspection_item = {
        "id": insp_uuid,
        "project_id": project_id if len(project_id) == 36 else None,
        "inspection_date": now_str,
        "physical_progress": phys_prog,
        "location_verified": bool(payload.get("is_location_verified", True)),
        "inspection_notes": notes,
        "latitude": float(payload.get("latitude") or proj.get("latitude") or 21.3554),
        "longitude": float(payload.get("longitude") or proj.get("longitude") or 72.7368),
        "inspector_user_id": payload.get("officer_id", "usr-mo-official"),
        "inspector_name": payload.get("inspector_name", "Field Monitoring Officer"),
        "created_at": now_str
    }

    if "inspections" not in proj or not isinstance(proj["inspections"], list):
        proj["inspections"] = []
    proj["inspections"].append(inspection_item)
    proj["physical_progress"] = phys_prog

    # Persist to Supabase
    SupabaseClientService.insert_project_inspection(inspection_item)
    SupabaseClientService.insert_governance_audit_log({
        "id": str(uuid.uuid4()),
        "project_id": project_id if len(project_id) == 36 else None,
        "entity_type": "INSPECTION",
        "entity_id": insp_uuid,
        "action": "SUBMIT_INSPECTION",
        "previous_state": {"physical_progress": proj.get("physical_progress", 0.0)},
        "new_state": {"physical_progress": phys_prog, "notes": notes},
        "performed_by_user_id": inspection_item["inspector_user_id"],
        "performed_by_name": inspection_item["inspector_name"],
        "performed_by_role": "MONITORING_OFFICER",
        "state_name": "Maharashtra",
        "district_name": proj.get("district_name", "Pune"),
        "constituency_name": proj.get("constituency_name", "Pune Constituency"),
        "created_at": now_str
    })

    return {"status": "success", "message": "Inspection report recorded and persisted", "inspection": inspection_item}

@router.post("/projects/{project_id}/verification-response")
def respond_verification_query(project_id: str, payload: dict):
    proj = DataLoaderService.get_project_by_id(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    if "verification_responses" not in proj or not isinstance(proj["verification_responses"], list):
        proj["verification_responses"] = []

    resp_item = {
        "response_id": f"VR-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "query_id": payload.get("query_id", "Q-001"),
        "project_id": project_id,
        "response_text": payload.get("response_text", ""),
        "submitted_by": payload.get("submitted_by", "Implementing Agency"),
        "submitted_at": datetime.now().isoformat(),
        "supporting_evidence_id": payload.get("supporting_evidence_id", None),
        "status": "SUBMITTED"
    }

    proj["verification_responses"].append(resp_item)

    if "audit_history" not in proj:
        proj["audit_history"] = []
    proj["audit_history"].append({
        "timestamp": datetime.now().isoformat(),
        "action": "VERIFICATION_RESPONSE_SUBMITTED",
        "performed_by": "Implementing Agency",
        "details": f"Response submitted for query {resp_item['query_id']}: {payload.get('response_text', '')[:60]}..."
    })

    return {"status": "success", "message": "Verification query response submitted successfully", "response": resp_item}

@router.post("/projects/{project_id}/completion")
def submit_project_completion(project_id: str, req: ProjectCompletionRequest):
    proj = DataLoaderService.get_project_by_id(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    now_iso = datetime.now().isoformat()
    old_status = proj.get("status", "IN_PROGRESS")
    proj["physical_progress"] = 100.0
    proj["status"] = "COMPLETED"
    proj["completion_certificate"] = req.completion_certificate_file or f"COMPLETION_CERT_{project_id}.pdf"
    proj["completion_date"] = now_iso[:10]

    SupabaseClientService.insert_governance_decision({
        "id": str(uuid.uuid4()),
        "project_id": project_id if len(project_id) == 36 else None,
        "decision_type": "COMPLETED",
        "decision_reason": req.remarks or "Project physical completion certificate submitted",
        "remarks": "Project marked as COMPLETED by Implementing Agency",
        "previous_status": old_status,
        "new_status": "COMPLETED",
        "decided_by_user_id": "usr-ia-official",
        "decided_by_name": req.submitted_by or "Implementing Agency Officer",
        "decided_by_role": "IMPLEMENTING_AGENCY",
        "created_at": now_iso
    })

    SupabaseClientService.insert_governance_audit_log({
        "id": str(uuid.uuid4()),
        "project_id": project_id if len(project_id) == 36 else None,
        "entity_type": "PROJECT",
        "entity_id": project_id,
        "action": "COMPLETE_PROJECT",
        "previous_state": {"status": old_status},
        "new_state": {"status": "COMPLETED", "physical_progress": 100.0},
        "performed_by_user_id": "usr-ia-official",
        "performed_by_name": req.submitted_by or "Implementing Agency Officer",
        "performed_by_role": "IMPLEMENTING_AGENCY",
        "state_name": "Maharashtra",
        "district_name": proj.get("district_name", "Pune"),
        "constituency_name": proj.get("constituency_name", "Pune Constituency"),
        "created_at": now_iso
    })

    return {"status": "success", "message": "Project completion package submitted successfully", "project": proj}


