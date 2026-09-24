-- 010_risk.sql
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    overall_trust_score NUMERIC(5, 2) NOT NULL,
    financial_score NUMERIC(5, 2) NOT NULL,
    timeline_score NUMERIC(5, 2) NOT NULL,
    evidence_score NUMERIC(5, 2) NOT NULL,
    document_score NUMERIC(5, 2) NOT NULL,
    peer_score NUMERIC(5, 2) NOT NULL,
    location_score NUMERIC(5, 2) NOT NULL,
    isolation_forest_anomaly_score NUMERIC(5, 4),
    model_version VARCHAR(50) NOT NULL DEFAULT 'v1.0.0',
    feature_version VARCHAR(50) NOT NULL DEFAULT 'v1.0.0',
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anomaly_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    reason_code VARCHAR(100) NOT NULL,
    severity verification_priority NOT NULL,
    explanation TEXT NOT NULL,
    affected_field VARCHAR(100),
    recommended_action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
