import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.recommendation_service import RecommendationService

client = TestClient(app)

def test_mp_recommendation_creation_and_persistence():
    payload = {
        "project_title": "Test Paver Block Road Construction",
        "project_description": "Connecting Main Village Chowk to Primary Health Centre",
        "sector": "Roads & Bridges",
        "estimated_cost": 2500000.0,
        "village": "Rampur",
        "taluka": "Haveli",
        "district": "D007",
        "state": "Maharashtra",
        "constituency_id": "C001",
        "constituency_name": "Maharashtra Demo Constituency 13",
        "recommended_by_user_id": "USER-MP-TEST-01",
        "recommended_by_name": "Test MP Honble Leader",
        "recommended_by_role": "MP",
        "mp_id": "MP-TEST-01",
        "mp_name": "Test MP Honble Leader",
        "justification": "Urgent connectivity for emergency medical access.",
        "expected_beneficiaries": "approx 8,500 villagers"
    }

    # Test POST endpoint with MP role
    response = client.post("/api/v1/recommendations", json=payload, headers={"X-User-Role": "MP"})
    assert response.status_code == 201
    data = response.json()

    assert "recommendation_id" in data
    rec_id = data["recommendation_id"]
    assert data["status"] in ["RECOMMENDED", "RECOMMENDED_BY_MP"]
    assert data["project_title"] == payload["project_title"]

    # Verify GET by ID
    get_resp = client.get(f"/api/v1/recommendations/{rec_id}")
    assert get_resp.status_code == 200
    rec_detail = get_resp.json()
    assert rec_detail["recommendation"]["recommendation_id"] == rec_id
    assert len(rec_detail["audit_logs"]) >= 1

def test_rbac_non_mp_creation_blocked():
    payload = {
        "project_title": "Unauthorized District Project Creation",
        "sector": "Education",
        "estimated_cost": 1000000.0,
        "district": "D007"
    }

    # District Authority role must be forbidden (HTTP 403)
    da_resp = client.post("/api/v1/recommendations", json=payload, headers={"X-User-Role": "DISTRICT_AUTHORITY"})
    assert da_resp.status_code == 403
    assert "Security Violation" in da_resp.json()["detail"]

    # Monitoring Officer role must be forbidden (HTTP 403)
    mo_resp = client.post("/api/v1/recommendations", json=payload, headers={"X-User-Role": "MONITORING_OFFICER"})
    assert mo_resp.status_code == 403
    assert "Security Violation" in mo_resp.json()["detail"]

def test_workflow_status_change_and_project_conversion():
    # 1. MP creates recommendation
    payload = {
        "project_title": "Construction of Primary School Solar Roof",
        "sector": "Education",
        "estimated_cost": 1500000.0,
        "district": "D007",
        "mp_name": "Test MP Workflow",
        "justification": "Green energy transition for school."
    }
    create_resp = client.post("/api/v1/recommendations", json=payload, headers={"X-User-Role": "MP"})
    assert create_resp.status_code == 201
    rec = create_resp.json()
    rec_id = rec["recommendation_id"]

    # 2. District Authority updates status to UNDER_REVIEW
    review_resp = client.put(
        f"/api/v1/recommendations/{rec_id}/status",
        json={"status": "UNDER_REVIEW", "remarks": "Reviewing land availability"},
        headers={"X-User-Role": "DISTRICT_AUTHORITY"}
    )
    assert review_resp.status_code == 200
    assert review_resp.json()["recommendation"]["status"] == "UNDER_REVIEW"

    # 3. District Authority approves recommendation (SANCTIONED) -> project conversion
    sanction_resp = client.put(
        f"/api/v1/recommendations/{rec_id}/status",
        json={"status": "SANCTIONED", "remarks": "Technical feasibility verified. Sanctioned."},
        headers={"X-User-Role": "DISTRICT_AUTHORITY"}
    )
    assert sanction_resp.status_code == 200
    s_data = sanction_resp.json()
    assert s_data["recommendation"]["status"] == "SANCTIONED"
    assert s_data["project_created"] is not None
    assert s_data["project_created"]["recommendation_id"] == rec_id

    # 4. Verify audit history captures all steps
    audit_resp = client.get(f"/api/v1/recommendations/{rec_id}/audit")
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    assert len(logs) >= 3

def test_recommendations_summary_endpoint():
    resp = client.get("/api/v1/recommendations/summary")
    assert resp.status_code == 200
    summary = resp.json()
    assert "total_recommendations" in summary
    assert "by_mp" in summary
    assert "by_district" in summary
    assert "status_distribution" in summary
