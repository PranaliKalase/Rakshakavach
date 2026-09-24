from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class AnomalyFindingSchema(BaseModel):
    reason_code: str
    severity: str
    explanation: str
    affected_field: Optional[str] = None
    recommended_action: str

class RiskAssessmentResponse(BaseModel):
    project_id: str
    project_code: str
    trust_score: float
    verification_assessment: str
    total_signals_count: int
    findings: List[AnomalyFindingSchema]
    radar_factors: Dict[str, str]
    explanation_headline: str
    disclaimer: str
