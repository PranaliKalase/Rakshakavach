-- 008_evidence.sql
CREATE TABLE IF NOT EXISTS evidence_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_code VARCHAR(50) UNIQUE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    evidence_type evidence_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    uploaded_by UUID REFERENCES profiles(id),
    verification_status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION',
    is_integrity_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
