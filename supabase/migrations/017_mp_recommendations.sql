-- 017_mp_recommendations.sql
-- RAKSHKAVACH — MP Work Recommendation Persistence Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- MP Recommendations Table
CREATE TABLE IF NOT EXISTS mp_recommendations (
    recommendation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT,
    sector VARCHAR(100) NOT NULL,
    estimated_cost NUMERIC(15, 2) NOT NULL CHECK (estimated_cost >= 0),
    village VARCHAR(100),
    taluka VARCHAR(100),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Maharashtra',
    constituency_id VARCHAR(50) NOT NULL,
    constituency_name VARCHAR(200) NOT NULL,
    recommended_by_user_id VARCHAR(50) NOT NULL,
    recommended_by_name VARCHAR(200) NOT NULL,
    recommended_by_role VARCHAR(50) DEFAULT 'MP',
    mp_id VARCHAR(50) NOT NULL,
    mp_name VARCHAR(200) NOT NULL,
    recommended_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'RECOMMENDED_BY_MP',
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    justification TEXT,
    expected_beneficiaries TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Governance Audit Logs Table
CREATE TABLE IF NOT EXISTS governance_audit_logs (
    audit_id VARCHAR(50) PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL DEFAULT 'RECOMMENDATION',
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(200) NOT NULL,
    performed_role VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Add recommendation_id column to projects table if it does not exist for traceability
ALTER TABLE projects ADD COLUMN IF NOT EXISTS recommendation_id UUID REFERENCES mp_recommendations(recommendation_id) ON DELETE SET NULL;
