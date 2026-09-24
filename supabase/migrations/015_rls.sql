-- 015_rls.sql
-- Enable Row Level Security on all exposed tables
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE constituencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Security Definer functions to prevent RLS infinite recursion on profiles
CREATE OR REPLACE FUNCTION public.check_user_role(target_roles user_role[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = ANY(target_roles)
    );
$$;

CREATE OR REPLACE FUNCTION public.get_user_district_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT district_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_constituency_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT constituency_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_agency_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT agency_id FROM profiles WHERE id = auth.uid();
$$;

-- Drop existing policies if present before recreating
DROP POLICY IF EXISTS profiles_self_read ON profiles;
DROP POLICY IF EXISTS projects_role_scope ON projects;
DROP POLICY IF EXISTS states_all_access ON states;
DROP POLICY IF EXISTS districts_all_access ON districts;
DROP POLICY IF EXISTS constituencies_all_access ON constituencies;
DROP POLICY IF EXISTS agencies_all_access ON agencies;
DROP POLICY IF EXISTS vendors_all_access ON vendors;
DROP POLICY IF EXISTS profiles_all_write ON profiles;
DROP POLICY IF EXISTS projects_all_write ON projects;
DROP POLICY IF EXISTS project_status_history_all_access ON project_status_history;
DROP POLICY IF EXISTS progress_all_write ON progress_updates;
DROP POLICY IF EXISTS evidence_all_write ON evidence_files;
DROP POLICY IF EXISTS documents_all_access ON documents;
DROP POLICY IF EXISTS payments_all_access ON payments;
DROP POLICY IF EXISTS inspections_all_write ON field_inspections;
DROP POLICY IF EXISTS peer_benchmarks_all_access ON peer_benchmarks;
DROP POLICY IF EXISTS risk_all_write ON risk_assessments;
DROP POLICY IF EXISTS anomaly_findings_all_access ON anomaly_findings;
DROP POLICY IF EXISTS audit_all_write ON audit_logs;

-- Profiles: Users can view their own profile, admins can view all, or allow read if auth.uid() is null (anon)
CREATE POLICY profiles_self_read ON profiles
    FOR SELECT USING (
        auth.uid() IS NULL
        OR auth.uid() = id
        OR check_user_role(ARRAY['ADMIN'::user_role])
    );

-- Projects: Role-based & Jurisdiction Scoped Access (also allows public/anon read for demo visibility)
CREATE POLICY projects_role_scope ON projects
    FOR SELECT USING (
        auth.uid() IS NULL
        OR check_user_role(ARRAY['ADMIN'::user_role, 'MINISTRY'::user_role])
        OR (check_user_role(ARRAY['MP'::user_role]) AND constituency_id = get_user_constituency_id())
        OR (check_user_role(ARRAY['DISTRICT_AUTHORITY'::user_role, 'MONITORING_OFFICER'::user_role]) AND district_id = get_user_district_id())
        OR (check_user_role(ARRAY['IMPLEMENTING_AGENCY'::user_role]) AND agency_id = get_user_agency_id())
    );

-- Allow full write/read operations across all tables for application data ingestion and demo workflows
CREATE POLICY states_all_access ON states FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY districts_all_access ON districts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY constituencies_all_access ON constituencies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY agencies_all_access ON agencies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY vendors_all_access ON vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY profiles_all_write ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY projects_all_write ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY project_status_history_all_access ON project_status_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY progress_all_write ON progress_updates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY evidence_all_write ON evidence_files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY documents_all_access ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY payments_all_access ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY inspections_all_write ON field_inspections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY peer_benchmarks_all_access ON peer_benchmarks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY risk_all_write ON risk_assessments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY anomaly_findings_all_access ON anomaly_findings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY audit_all_write ON audit_logs FOR ALL USING (true) WITH CHECK (true);




