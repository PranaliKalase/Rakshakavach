-- 016_phase1_tables.sql
-- Extension tables for Phase 1: Real Data Ingestion & Feature Engineering Foundation

-- Add provenance column to projects if it does not exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS provenance VARCHAR(30) DEFAULT 'OFFICIAL';

-- Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(50),
    sector VARCHAR(100),
    rating NUMERIC(3, 2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_ref VARCHAR(50) UNIQUE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_code VARCHAR(50) UNIQUE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    doc_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Peer Benchmarks Table
CREATE TABLE IF NOT EXISTS peer_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sector VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    avg_cost NUMERIC(15, 2) NOT NULL CHECK (avg_cost >= 0),
    avg_duration_days INT NOT NULL CHECK (avg_duration_days >= 0),
    project_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Features Foundation Table
CREATE TABLE IF NOT EXISTS ai_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE NOT NULL,
    financial_progress NUMERIC(5, 2) NOT NULL,
    physical_progress NUMERIC(5, 2) NOT NULL,
    progress_gap_pct NUMERIC(7, 2) NOT NULL,
    sanctioned_amount NUMERIC(15, 2) NOT NULL,
    actual_expenditure NUMERIC(15, 2) NOT NULL,
    utilization_pct NUMERIC(7, 2) NOT NULL,
    cost_variance_pct NUMERIC(7, 2) NOT NULL,
    project_duration_days INT NOT NULL,
    payment_count INT NOT NULL DEFAULT 0,
    payment_concentration NUMERIC(5, 4) NOT NULL DEFAULT 0,
    evidence_count INT NOT NULL DEFAULT 0,
    document_count INT NOT NULL DEFAULT 0,
    inspection_count INT NOT NULL DEFAULT 0,
    peer_cost_ratio NUMERIC(7, 4) NOT NULL DEFAULT 1.0,
    gps_available BOOLEAN NOT NULL DEFAULT FALSE,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status alert_status DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
