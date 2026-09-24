from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EvidenceUploadResponse(BaseModel):
    id: str
    evidence_code: str
    project_id: str
    evidence_type: str
    file_name: str
    sha256_hash: str
    previous_hash: Optional[str] = None
    verification_status: str
    is_integrity_verified: bool
    created_at: datetime
