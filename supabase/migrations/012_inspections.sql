-- 012_inspections.sql
CREATE TABLE IF NOT EXISTS field_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_code VARCHAR(50) UNIQUE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    assigned_officer_id UUID REFERENCES profiles(id),
    actual_physical_progress NUMERIC(5, 2) CHECK (actual_physical_progress BETWEEN 0 AND 100),
    observed_condition TEXT,
    is_location_verified BOOLEAN DEFAULT FALSE,
    verification_outcome VARCHAR(50) NOT NULL, -- e.g., 'VERIFIED', 'REQUIRES_FURTHER_EVIDENCE', 'ESCALATED'
    officer_remarks TEXT,
    inspection_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 013_audit_logs.sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    user_role user_role,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(45),
    request_id VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
