import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.data_validation import DataValidator, ImportValidationReport
from app.services.feature_engineering import FeatureEngineeringService
from app.services.data_loader import DataLoaderService

def test_data_validation_layer():
    # Valid project
    valid_project = {
        "id": "test-001",
        "projectCode": "MPLADS-2026-TEST-001",
        "workName": "Test Solar Light Project",
        "status": "IN_PROGRESS",
        "allocatedAmount": 1000000.0,
        "sanctionedCost": 1000000.0,
        "actualExpenditure": 500000.0,
        "physicalProgress": 50.0,
        "financialProgress": 50.0,
        "latitude": 28.6139,
        "longitude": 77.2090
    }
    report = ImportValidationReport()
    assert DataValidator.validate_project(valid_project, report) is True
    assert report.total_valid == 1
    assert report.total_invalid == 0

    # Invalid project (negative cost & invalid progress)
    invalid_project = {
        "id": "test-002",
        "projectCode": "MPLADS-2026-TEST-002",
        "workName": "",
        "status": "INVALID_STATUS",
        "sanctionedCost": -500.0,
        "actualExpenditure": -100.0,
        "physicalProgress": 150.0,
        "financialProgress": -20.0,
        "latitude": 120.0,  # Invalid lat > 90
        "longitude": 200.0  # Invalid lng > 180
    }
    report2 = ImportValidationReport()
    assert DataValidator.validate_project(invalid_project, report2) is False
    assert report2.total_invalid == 1
    assert len(report2.errors) >= 5

def test_feature_engineering_foundation():
    project = {
        "id": "test-feat-01",
        "sanctionedCost": 10000000.0,
        "actualExpenditure": 8000000.0,
        "physicalProgress": 40.0,
        "financialProgress": 80.0,
        "sector": "Healthcare & Drinking Water",
        "latitude": 19.0760,
        "longitude": 72.8777
    }
    payments = [
        {"amount": 5000000.0},
        {"amount": 3000000.0}
    ]
    evidence = [{"id": "ev1"}, {"id": "ev2"}]
    documents = [{"id": "doc1"}]
    inspections = [{"id": "insp1"}]

    features = FeatureEngineeringService.extract_features(
        project=project,
        payments=payments,
        evidence_files=evidence,
        documents=documents,
        inspections=inspections
    )

    assert features["financial_progress"] == 80.0
    assert features["physical_progress"] == 40.0
    assert features["progress_gap_pct"] == 40.0  # 80.0 - 40.0
    assert features["sanctioned_amount"] == 10000000.0
    assert features["actual_expenditure"] == 8000000.0
    assert features["utilization_pct"] == 80.0
    assert features["cost_variance_pct"] == -20.0  # (8000000 - 10000000)/10000000 * 100
    assert features["payment_count"] == 2
    assert features["payment_concentration"] > 0.5  # Herfindahl index (0.625^2 + 0.375^2 = 0.53125)
    assert features["evidence_count"] == 2
    assert features["document_count"] == 1
    assert features["inspection_count"] == 1
    assert features["gps_available"] is True
    assert features["peer_cost_ratio"] == 0.1  # 10M / 100M peer benchmark

def test_dataset_ingestion_subset():
    projects = DataLoaderService.load_dataset(force_reload=True)
    assert len(projects) == 500

    # Check subset of 10 projects
    subset = projects[:10]
    for proj in subset:
        assert proj["provenance"] in ["OFFICIAL", "SYNTHETIC DEMO DATA"]
        assert "ai_features" in proj
        assert isinstance(proj["ai_features"], dict)

def test_single_project_relational_trace():
    projects = DataLoaderService.load_dataset()
    first_id = projects[0]["id"]
    relational = DataLoaderService.get_project_full_relational(first_id)
    assert relational is not None

    p = relational["project"]
    fin = relational["financials"]
    prog = relational["progress"]
    feat = relational["ai_features"]

    assert p["id"] == first_id
    assert "sanctioned_cost" in fin
    assert "physical_progress" in prog
    assert "financial_progress" in prog
    assert "progress_gap_pct" in feat

