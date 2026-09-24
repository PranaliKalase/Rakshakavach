from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.data_loader import DataLoaderService
from app.ml.explainability import ExplainableAIEngine
from app.ml.similarity_model import DuplicateSimilarityEngine
from app.schemas.risk import RiskAssessmentResponse
from app.services.supabase_client import SupabaseClientService

router = APIRouter()

@router.get("/projects/{project_id}/risk", response_model=RiskAssessmentResponse)
def get_project_risk(project_id: str):
    target = SupabaseClientService.fetch_project_by_id(project_id)

    if not target:
        target = DataLoaderService.get_project_by_id(project_id)

    if not target:
        raise HTTPException(status_code=404, detail="Project not found")

    assessment = ExplainableAIEngine.generate_assessment(target)
    return assessment


@router.get("/projects/{project_id}/similar")
def get_similar_projects(project_id: str):
    all_projects = SupabaseClientService.fetch_projects(limit=500) or DataLoaderService.load_dataset()
    target = None
    candidates = []

    for p in all_projects:
        if p.get("id") == project_id or p.get("project_code") == project_id:
            target = p
        else:
            candidates.append(p)

    if not target:
        raise HTTPException(status_code=404, detail="Project not found")

    similar = DuplicateSimilarityEngine.find_similar_projects(target, candidates[:100])
    return {
        "project_id": target["id"],
        "similar_projects_count": len(similar),
        "similarities": similar,
        "disclaimer": "Potentially similar projects identified for administrative review."
    }


