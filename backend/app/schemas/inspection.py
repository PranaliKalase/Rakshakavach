from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class FieldInspectionCreate(BaseModel):
    project_id: str
    actual_physical_progress: float = Field(..., ge=0, le=100)
    observed_condition: str
    is_location_verified: bool = False
    verification_outcome: str # 'VERIFIED', 'REQUIRES_FURTHER_EVIDENCE', 'ESCALATED'
    officer_remarks: Optional[str] = None

class FieldInspectionResponse(FieldInspectionCreate):
    id: str
    inspection_code: str
    assigned_officer_id: Optional[str] = None
    inspection_date: date
    created_at: datetime
