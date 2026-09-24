from typing import Dict, Any, List, Optional
from app.ml.multi_factor_engine import MultiFactorAnomalyEngine
from app.services.data_loader import DataLoaderService

class ExplainableAIEngine:
    """
    Aggregates trust scores, anomaly findings, statistical Z-scores, and ML predictions.
    Computes human-understandable "Why does this project require attention?" panel data.
    """

    @classmethod
    def generate_assessment(cls, project: Dict[str, Any], population: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        if population is None:
            population = DataLoaderService.load_dataset()

        return MultiFactorAnomalyEngine.evaluate_project(project, population)
