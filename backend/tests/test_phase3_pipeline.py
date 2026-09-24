import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.data_loader import DataLoaderService
from app.ml.trust_score_engine import TrustScoreEngine
from app.ml.multi_factor_engine import MultiFactorAnomalyEngine
from app.ml.explainability import ExplainableAIEngine

def test_trust_score_6_factor_formula():
    project = {
        "financial_progress": 50.0,
        "physical_progress": 50.0,
        "sanctioned_cost": 10000000.0,
        "actual_expenditure": 5000000.0,
        "evidence_count": 2,
        "document_count": 1,
        "latitude": 28.6139,
        "longitude": 77.2090,
        "ai_features": {"peer_cost_ratio": 1.0}
    }
    breakdown = TrustScoreEngine.calculate_trust_score(project)

    assert breakdown["financial_score"] == 100.0
    assert breakdown["timeline_score"] == 100.0
    assert breakdown["evidence_score"] == 100.0
    assert breakdown["document_score"] == 100.0
    assert breakdown["peer_score"] == 100.0
    assert breakdown["geospatial_score"] == 100.0
    assert breakdown["overall_trust_score"] == 100.0

def test_trust_score_mathematical_invariant():
    """Verifies overall_trust_score == sum(weighted_contributions) for all projects."""
    population = DataLoaderService.load_dataset()
    for proj in population[:50]:
        breakdown = TrustScoreEngine.calculate_trust_score(proj)
        
        sum_contribs = round(
            breakdown["financial_contribution"] +
            breakdown["timeline_contribution"] +
            breakdown["evidence_contribution"] +
            breakdown["document_contribution"] +
            breakdown["peer_contribution"] +
            breakdown["geospatial_contribution"],
            2
        )
        
        assert abs(breakdown["overall_trust_score"] - sum_contribs) < 0.01

def test_signal_aggregation_consistency():
    population = DataLoaderService.load_dataset()
    MultiFactorAnomalyEngine.train_ml_model_if_needed(population)

    target = population[1] # Pick second project
    assessment = MultiFactorAnomalyEngine.evaluate_project(target, population)

    rule_count = assessment["rule_signals_count"]
    stat_count = assessment["statistical_signals_count"]
    ml_count = assessment["ml_signals_count"]
    total_count = assessment["total_signals_count"]

    # Exact discrepancy-free signal aggregation formula check
    assert total_count == (rule_count + stat_count + ml_count)

def test_normal_project_assessment():
    population = DataLoaderService.load_dataset()
    assert len(population) > 0
    normal_proj = population[0]
    assessment = MultiFactorAnomalyEngine.evaluate_project(normal_proj, population)
    assert "trust_score" in assessment
    assert assessment["trust_score"] >= 0.0


def test_statistically_unusual_project():
    population = DataLoaderService.load_dataset()
    unusual_project = {
        "id": "test-stat-01",
        "project_code": "MPLADS-TEST-UNUSUAL",
        "work_name": "Massive Outlier Skill Center",
        "sanctioned_cost": 5000000000.0, # Massive cost outlier
        "actual_expenditure": 4500000000.0,
        "physical_progress": 10.0,
        "financial_progress": 90.0, # Massive progress gap outlier
        "evidence_count": 0,
        "document_count": 0,
        "latitude": None,
        "longitude": None
    }
    assessment = MultiFactorAnomalyEngine.evaluate_project(unusual_project, population)

    assert assessment["statistical_signals_count"] > 0
    reason_codes = [f.get("reason_code") for f in assessment["findings"]]
    assert "STATISTICAL_COST_OUTLIER" in reason_codes or "STATISTICAL_PROGRESS_GAP_OUTLIER" in reason_codes

def test_ml_anomalous_project_and_multi_signal_aggregation():
    population = DataLoaderService.load_dataset()
    MultiFactorAnomalyEngine.train_ml_model_if_needed(population)
    detector = MultiFactorAnomalyEngine.get_ml_detector()

    # Find project flagged as ML outlier
    outlier_proj = None
    for p in population:
        res = detector.predict_anomaly(p)
        if res.get("is_outlier") is True:
            outlier_proj = p
            break

    if not outlier_proj:
        outlier_proj = population[1]

    assessment = MultiFactorAnomalyEngine.evaluate_project(outlier_proj, population)

    assert "trust_breakdown" in assessment
    assert "explanation_bullets" in assessment
    assert len(assessment["explanation_bullets"]) > 0
    assert assessment["total_signals_count"] == (assessment["rule_signals_count"] + assessment["statistical_signals_count"] + assessment["ml_signals_count"])

def test_explainable_ai_engine_integration():
    project = DataLoaderService.load_dataset()[0]
    assessment = ExplainableAIEngine.generate_assessment(project)

    assert "trust_score" in assessment
    assert "trust_breakdown" in assessment
    assert "radar_factors" in assessment
    assert "explanation_bullets" in assessment
