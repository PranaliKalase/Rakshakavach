import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.data_loader import DataLoaderService
from app.services.feature_engineering import FeatureEngineeringService
from app.ml.statistical_engine import StatisticalAnomalyDetector
from app.ml.anomaly_model import IsolationForestAnomalyDetector
from app.ml.multi_factor_engine import MultiFactorAnomalyEngine

def test_feature_vector_generation_safety():
    project = {
        "id": "test-safety-01",
        "project_code": "MPLADS-TEST-001",
        "sanctioned_cost": 5000000.0,
        "actual_expenditure": 2500000.0,
        "physical_progress": 50.0,
        "financial_progress": 50.0
    }
    detector = IsolationForestAnomalyDetector()
    vec = detector._extract_feature_vector(project)
    
    assert len(vec) == 10
    # Ensure all elements are numbers
    for val in vec:
        assert isinstance(val, (int, float))
        assert not isinstance(val, str)

def test_statistical_calculation():
    population = DataLoaderService.load_dataset()
    stats = StatisticalAnomalyDetector.evaluate_population(population)

    assert "sanctioned_cost" in stats
    assert "progress_gap" in stats
    assert stats["sanctioned_cost"]["mean"] > 0
    assert stats["sanctioned_cost"]["std_dev"] > 0

    # Pick an outlier project
    outlier_proj = {
        "sanctioned_cost": stats["sanctioned_cost"]["mean"] + (3.5 * stats["sanctioned_cost"]["std_dev"]),
        "financial_progress": 90.0,
        "physical_progress": 10.0
    }
    findings = StatisticalAnomalyDetector.evaluate_project(outlier_proj, stats)
    reason_codes = [f["reason_code"] for f in findings]

    assert "STATISTICAL_COST_OUTLIER" in reason_codes
    assert "STATISTICAL_PROGRESS_GAP_OUTLIER" in reason_codes

def test_isolation_forest_training_and_inference():
    population = DataLoaderService.load_dataset()
    detector = IsolationForestAnomalyDetector(contamination=0.08)

    # Train ML model
    train_res = detector.fit(population)
    assert train_res["status"] == "TRAINED"
    assert train_res["samples_trained"] == len(population)
    assert detector.is_trained is True

    # Inference on normal project
    normal_proj = population[0]
    res_normal = detector.predict_anomaly(normal_proj)
    assert res_normal["status"] == "HEALTHY"
    assert isinstance(res_normal["anomaly_score"], float)
    assert res_normal["ml_anomaly_label"] in ["ANOMALOUS", "NORMAL"]

def test_multi_factor_anomaly_engine():
    population = DataLoaderService.load_dataset()
    MultiFactorAnomalyEngine.train_ml_model_if_needed(population)

    target = population[1] # Pick second project
    assessment = MultiFactorAnomalyEngine.evaluate_project(target, population)

    assert "trust_score" in assessment
    assert "verification_priority" in assessment
    assert "ml_anomaly_detector" in assessment
    assert assessment["ml_anomaly_detector"]["status"] == "HEALTHY"
    assert "radar_factors" in assessment
    assert "ML Anomaly Detector" in assessment["radar_factors"]

def test_provenance_classification():
    population = DataLoaderService.load_dataset()
    p = population[0]

    assert p["provenance"] in ["OFFICIAL", "SYNTHETIC DEMO DATA"]
    assert p["financials"]["provenance"] == "DERIVED FROM OFFICIAL"
    assert p["progress"]["provenance"] == "DERIVED FROM OFFICIAL"
    assert p["ai_features"]["provenance"] == "PLATFORM-GENERATED"


def test_model_discovered_anomalous_project_trace():
    population = DataLoaderService.load_dataset()
    MultiFactorAnomalyEngine.train_ml_model_if_needed(population)
    detector = MultiFactorAnomalyEngine.get_ml_detector()

    # Discover a project flagged anomalous by Isolation Forest
    anomalous_project = None
    anomalous_result = None

    for proj in population:
        res = detector.predict_anomaly(proj)
        if res.get("is_outlier") is True:
            anomalous_project = proj
            anomalous_result = res
            break

    # If no outlier flagged in sample, find project with highest anomaly score
    if not anomalous_project:
        scored = [(p, detector.predict_anomaly(p)) for p in population]
        scored.sort(key=lambda x: x[1]["anomaly_score"], reverse=True)
        anomalous_project, anomalous_result = scored[0]

    assert anomalous_project is not None
    assert "id" in anomalous_project

    # Evaluate full multi-factor assessment on model-discovered anomalous project
    assessment = MultiFactorAnomalyEngine.evaluate_project(anomalous_project, population)

    assert assessment["project_id"] == str(anomalous_project["id"])
    assert assessment["ml_anomaly_detector"]["ml_anomaly_label"] in ["ANOMALOUS", "NORMAL"]
    assert assessment["ml_anomaly_detector"]["ml_anomaly_score"] >= 0.0
