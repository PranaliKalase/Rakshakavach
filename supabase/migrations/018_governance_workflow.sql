-- 018_governance_workflow.sql
-- RAKSHKAVACH — Complete Governance Actions & Audit Trail Supabase Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. MP WORK RECOMMENDATIONS TABLE (Defensive Creation & Schema Alignment)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mp_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_code TEXT UNIQUE,
    project_title TEXT NOT NULL,
    project_description TEXT,
    sector TEXT NOT NULL,
    estimated_cost NUMERIC(15, 2) NOT NULL CHECK (estimated_cost >= 0),
    state_name TEXT DEFAULT 'Maharashtra',
    district_name TEXT,
    constituency_id TEXT,
    constituency_name TEXT,
    recommended_by_user_id TEXT,
    recommended_by_name TEXT,
    mp_id TEXT,
    mp_name TEXT,
    status TEXT DEFAULT 'RECOMMENDED',
    remarks TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure 'id' column exists if table was originally created by 017_mp_recommendations.sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mp_recommendations' AND column_name = 'id'
    ) THEN
        ALTER TABLE mp_recommendations ADD COLUMN id UUID DEFAULT gen_random_uuid();
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'mp_recommendations' AND column_name = 'recommendation_id'
        ) THEN
            UPDATE mp_recommendations SET id = recommendation_id WHERE id IS NULL;
        END IF;
    END IF;
END $$;

-- Ensure 'id' column has a UNIQUE constraint so foreign keys can reference it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'mp_recommendations' 
        AND constraint_type IN ('PRIMARY KEY', 'UNIQUE') 
        AND constraint_name = 'mp_recommendations_id_key'
    ) THEN
        BEGIN
            ALTER TABLE mp_recommendations ADD CONSTRAINT mp_recommendations_id_key UNIQUE (id);
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END IF;
END $$;

-- Safely add missing columns to mp_recommendations if table pre-existed from 017
DO $$
BEGIN
    ALTER TABLE mp_recommendations ADD COLUMN IF NOT EXISTS recommendation_code TEXT;
    ALTER TABLE mp_recommendations ADD COLUMN IF NOT EXISTS district_name TEXT;
    ALTER TABLE mp_recommendations ADD COLUMN IF NOT EXISTS state_name TEXT DEFAULT 'Maharashtra';
    ALTER TABLE mp_recommendations ADD COLUMN IF NOT EXISTS remarks TEXT;
    ALTER TABLE mp_recommendations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mp_recommendations' AND column_name = 'district'
    ) THEN
        UPDATE mp_recommendations SET district_name = district WHERE district_name IS NULL;
    END IF;
END $$;

-- Recommendation Code Generator Sequence & Trigger
CREATE SEQUENCE IF NOT EXISTS recommendation_code_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION generate_recommendation_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.recommendation_code IS NULL OR NEW.recommendation_code = '' THEN
        NEW.recommendation_code := 'REC-2026-' || LPAD(nextval('recommendation_code_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_recommendation_code ON mp_recommendations;
CREATE TRIGGER trg_generate_recommendation_code
BEFORE INSERT ON mp_recommendations
FOR EACH ROW
EXECUTE FUNCTION generate_recommendation_code();


-- ============================================================================
-- 2. GOVERNANCE DECISIONS TABLE (District Authority / Admin Decisions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS governance_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID,
    recommendation_id UUID REFERENCES mp_recommendations(id) ON DELETE SET NULL,
    decision_type TEXT NOT NULL, -- APPROVED, REJECTED, CLARIFICATION_REQUIRED, SANCTIONED, COMPLETED
    decision_reason TEXT,
    remarks TEXT,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    decided_by_user_id TEXT NOT NULL,
    decided_by_name TEXT NOT NULL,
    decided_by_role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 3. MONITORING OFFICER INSPECTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID,
    recommendation_id UUID REFERENCES mp_recommendations(id) ON DELETE SET NULL,
    inspection_date TIMESTAMPTZ DEFAULT NOW(),
    physical_progress NUMERIC(5, 2) NOT NULL CHECK (physical_progress >= 0 AND physical_progress <= 100),
    location_verified BOOLEAN DEFAULT true,
    inspection_notes TEXT,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    inspector_user_id TEXT NOT NULL,
    inspector_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 4. PROJECT PROGRESS UPDATES TABLE (Implementing Agency)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_progress_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID,
    recommendation_id UUID REFERENCES mp_recommendations(id) ON DELETE SET NULL,
    physical_progress NUMERIC(5, 2) NOT NULL CHECK (physical_progress >= 0 AND physical_progress <= 100),
    financial_progress NUMERIC(5, 2) NOT NULL CHECK (financial_progress >= 0 AND financial_progress <= 100),
    remarks TEXT,
    updated_by_user_id TEXT NOT NULL,
    updated_by_name TEXT NOT NULL,
    updated_by_role TEXT NOT NULL DEFAULT 'IMPLEMENTING_AGENCY',
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 5. EVIDENCE UPLOADS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID,
    recommendation_id UUID REFERENCES mp_recommendations(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_url TEXT,
    file_type TEXT DEFAULT 'IMAGE',
    uploaded_by_user_id TEXT NOT NULL,
    uploaded_by_name TEXT NOT NULL,
    uploaded_by_role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 6. GOVERNANCE AUDIT LOG TABLE (Comprehensive Immutable Audit Trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS governance_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID,
    entity_type TEXT NOT NULL DEFAULT 'RECOMMENDATION',
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    performed_by_user_id TEXT,
    performed_by_name TEXT,
    performed_by_role TEXT,
    state_name TEXT DEFAULT 'Maharashtra',
    district_name TEXT,
    constituency_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add missing columns to governance_audit_logs if pre-existed from 017
DO $$
BEGIN
    ALTER TABLE governance_audit_logs ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
    ALTER TABLE governance_audit_logs ADD COLUMN IF NOT EXISTS project_id UUID;
    ALTER TABLE governance_audit_logs ADD COLUMN IF NOT EXISTS previous_state JSONB;
    ALTER TABLE governance_audit_logs ADD COLUMN IF NOT EXISTS new_state JSONB;
    ALTER TABLE governance_audit_logs ADD COLUMN IF NOT EXISTS performed_by_user_id TEXT;
    ALTER TABLE governance_audit_logs ADD COLUMN IF NOT EXISTS performed_by_name TEXT;
    ALTER TABLE governance_audit_logs ADD COLUMN IF NOT EXISTS performed_by_role TEXT;
    ALTER TABLE governance_audit_logs ADD COLUMN IF NOT EXISTS state_name TEXT DEFAULT 'Maharashtra';
    ALTER TABLE governance_audit_logs ADD COLUMN IF NOT EXISTS district_name TEXT;
    ALTER TABLE governance_audit_logs ADD COLUMN IF NOT EXISTS constituency_name TEXT;
    ALTER TABLE governance_audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
END $$;


-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_mp_rec_code ON mp_recommendations(recommendation_code);
CREATE INDEX IF NOT EXISTS idx_mp_rec_status ON mp_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_mp_rec_mp_name ON mp_recommendations(mp_name);
CREATE INDEX IF NOT EXISTS idx_mp_rec_district ON mp_recommendations(district_name);

CREATE INDEX IF NOT EXISTS idx_gov_dec_proj ON governance_decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_gov_dec_rec ON governance_decisions(recommendation_id);

CREATE INDEX IF NOT EXISTS idx_proj_insp_proj ON project_inspections(project_id);
CREATE INDEX IF NOT EXISTS idx_proj_prog_proj ON project_progress_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_proj_ev_proj ON project_evidence(project_id);

CREATE INDEX IF NOT EXISTS idx_gov_audit_proj ON governance_audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_gov_audit_entity ON governance_audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_gov_audit_action ON governance_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_gov_audit_role ON governance_audit_logs(performed_by_role);
CREATE INDEX IF NOT EXISTS idx_gov_audit_created ON governance_audit_logs(created_at DESC);


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE mp_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow select mp_recommendations" ON mp_recommendations;
    DROP POLICY IF EXISTS "Allow insert mp_recommendations" ON mp_recommendations;
    DROP POLICY IF EXISTS "Allow update mp_recommendations" ON mp_recommendations;

    CREATE POLICY "Allow select mp_recommendations" ON mp_recommendations FOR SELECT USING (true);
    CREATE POLICY "Allow insert mp_recommendations" ON mp_recommendations FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update mp_recommendations" ON mp_recommendations FOR UPDATE USING (true);

    DROP POLICY IF EXISTS "Allow select governance_decisions" ON governance_decisions;
    DROP POLICY IF EXISTS "Allow insert governance_decisions" ON governance_decisions;
    DROP POLICY IF EXISTS "Allow update governance_decisions" ON governance_decisions;

    CREATE POLICY "Allow select governance_decisions" ON governance_decisions FOR SELECT USING (true);
    CREATE POLICY "Allow insert governance_decisions" ON governance_decisions FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update governance_decisions" ON governance_decisions FOR UPDATE USING (true);

    DROP POLICY IF EXISTS "Allow select project_inspections" ON project_inspections;
    DROP POLICY IF EXISTS "Allow insert project_inspections" ON project_inspections;
    DROP POLICY IF EXISTS "Allow update project_inspections" ON project_inspections;

    CREATE POLICY "Allow select project_inspections" ON project_inspections FOR SELECT USING (true);
    CREATE POLICY "Allow insert project_inspections" ON project_inspections FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update project_inspections" ON project_inspections FOR UPDATE USING (true);

    DROP POLICY IF EXISTS "Allow select project_progress_updates" ON project_progress_updates;
    DROP POLICY IF EXISTS "Allow insert project_progress_updates" ON project_progress_updates;
    DROP POLICY IF EXISTS "Allow update project_progress_updates" ON project_progress_updates;

    CREATE POLICY "Allow select project_progress_updates" ON project_progress_updates FOR SELECT USING (true);
    CREATE POLICY "Allow insert project_progress_updates" ON project_progress_updates FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update project_progress_updates" ON project_progress_updates FOR UPDATE USING (true);

    DROP POLICY IF EXISTS "Allow select project_evidence" ON project_evidence;
    DROP POLICY IF EXISTS "Allow insert project_evidence" ON project_evidence;
    DROP POLICY IF EXISTS "Allow update project_evidence" ON project_evidence;

    CREATE POLICY "Allow select project_evidence" ON project_evidence FOR SELECT USING (true);
    CREATE POLICY "Allow insert project_evidence" ON project_evidence FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update project_evidence" ON project_evidence FOR UPDATE USING (true);

    DROP POLICY IF EXISTS "Allow select governance_audit_logs" ON governance_audit_logs;
    DROP POLICY IF EXISTS "Allow insert governance_audit_logs" ON governance_audit_logs;
    DROP POLICY IF EXISTS "Allow update governance_audit_logs" ON governance_audit_logs;

    CREATE POLICY "Allow select governance_audit_logs" ON governance_audit_logs FOR SELECT USING (true);
    CREATE POLICY "Allow insert governance_audit_logs" ON governance_audit_logs FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update governance_audit_logs" ON governance_audit_logs FOR UPDATE USING (true);
END $$;
