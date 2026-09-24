import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.ml.rule_engine import RuleEngine
from app.ml.anomaly_model import IsolationForestAnomalyDetector

def test_rule_engine_progress_mismatch():
    project = {
        "physical_progress": 38.0,
        "financial_progress": 82.0,
        "actual_expenditure": 2050000.0,
        "sanctioned_cost": 2500000.0,
        "evidence_count": 0
    }
    findings = RuleEngine.evaluate_project(project)
    reason_codes = [f["reason_code"] for f in findings]
    
    assert "PROGRESS_MISMATCH" in reason_codes
    assert "EVIDENCE_GAP" in reason_codes

def test_isolation_forest_prediction():
    detector = IsolationForestAnomalyDetector()
    project = {
        "estimated_cost": 100000,
        "sanctioned_cost": 100000,
        "actual_expenditure": 50000,
        "physical_progress": 50.0,
        "financial_progress": 50.0,
        "evidence_count": 2
    }
    res = detector.predict_anomaly(project)
    assert res["status"] in ["HEALTHY", "UNAVAILABLE"]
    if res["status"] == "HEALTHY":
        assert "anomaly_score" in res
        assert "ml_anomaly_label" in res
