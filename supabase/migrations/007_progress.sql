-- 007_progress.sql
CREATE TABLE IF NOT EXISTS progress_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    physical_progress NUMERIC(5, 2) NOT NULL CHECK (physical_progress BETWEEN 0 AND 100),
    financial_progress NUMERIC(5, 2) NOT NULL CHECK (financial_progress BETWEEN 0 AND 100),
    actual_expenditure NUMERIC(15, 2) NOT NULL CHECK (actual_expenditure >= 0),
    milestone VARCHAR(255),
    remarks TEXT,
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
