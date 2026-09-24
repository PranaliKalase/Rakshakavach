from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

class ProjectBase(BaseModel):
    work_name: str = Field(..., min_length=3, description="Name of the proposed MPLADS work")
    description: Optional[str] = None
    district_id: str
    constituency_id: str
    sector: str
    estimated_cost: float = Field(..., ge=0, description="Estimated project cost in INR")
    mp_name: Optional[str] = None
    allocation_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    expected_completion_date: Optional[date] = None

class ProjectCreate(ProjectBase):
    pass

from typing import Optional, List, Any

class ProjectResponse(ProjectBase):
    id: str
    project_code: str
    agency_id: Optional[str] = None
    sanctioned_cost: Optional[float] = 0.0
    actual_expenditure: float = 0.0
    physical_progress: float = 0.0
    financial_progress: float = 0.0
    status: str = "RECOMMENDED"
    priority: str = "NORMAL"
    trust_score: float = 100.0
    provenance: Optional[str] = "OFFICIAL"
    created_at: Optional[Any] = None
    updated_at: Optional[Any] = None

    class Config:
        from_attributes = True

class ProjectSanctionRequest(BaseModel):
    sanctioned_cost: float = Field(..., ge=0)
    remarks: Optional[str] = None

class ProjectAssignRequest(BaseModel):
    agency_id: str
    remarks: Optional[str] = None

class ProgressUpdateRequest(BaseModel):
    physical_progress: float = Field(..., ge=0, le=100)
    financial_progress: float = Field(..., ge=0, le=100)
    actual_expenditure: float = Field(..., ge=0)
    milestone: Optional[str] = None
    remarks: Optional[str] = None
