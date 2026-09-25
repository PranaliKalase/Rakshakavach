import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger("rakshakavach.supabase")

class SupabaseClientService:
    """
    Supabase Database Client & Direct REST API Service for RAKSHKAVACH.
    Executes queries and seeds data directly to Supabase PostgreSQL database tables.
    Gracefully falls back to local DataLoaderService if Supabase credentials are unset or unreachable.
    """

    @classmethod
    def is_configured(cls) -> bool:
        url = settings.SUPABASE_URL
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        return bool(url and key and "your-project" not in url)

    @classmethod
    def _get_headers(cls) -> Dict[str, str]:
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        return {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation,resolution=merge-duplicates"
        }

    @classmethod
    def test_connection(cls) -> bool:
        if not cls.is_configured():
            return False
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/projects?select=id&limit=1"
            resp = httpx.get(url, headers=cls._get_headers(), timeout=5.0)
            return resp.status_code in [200, 206]
        except Exception as e:
            logger.warning(f"Supabase connection check failed: {e}")
            return False

    @classmethod
    def fetch_projects(cls, limit: int = 50) -> Optional[List[Dict[str, Any]]]:
        if not cls.is_configured():
            return None
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/projects?select=*&limit={limit}"
            resp = httpx.get(url, headers=cls._get_headers(), timeout=5.0)
            if resp.status_code in [200, 206]:
                return resp.json()
        except Exception as e:
            logger.error(f"Error fetching projects from Supabase: {e}")
        return None

    @classmethod
    def fetch_project_by_id(cls, project_id: str) -> Optional[Dict[str, Any]]:
        if not cls.is_configured():
            return None
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/projects?id=eq.{project_id}&select=*"
            resp = httpx.get(url, headers=cls._get_headers(), timeout=5.0)
            if resp.status_code == 200 and resp.json():
                return resp.json()[0]
        except Exception as e:
            logger.error(f"Error fetching project {project_id} from Supabase: {e}")
        return None

    @classmethod
    def upsert_projects(cls, projects: List[Dict[str, Any]]) -> bool:
        if not cls.is_configured() or not projects:
            return False
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/projects"
            payload = []
            for p in projects:
                payload.append({
                    "id": p.get("id"),
                    "project_code": p.get("project_code"),
                    "work_name": p.get("work_name"),
                    "description": p.get("description"),
                    "district_id": p.get("district_id"),
                    "constituency_id": p.get("constituency_id"),
                    "agency_id": p.get("agency_id"),
                    "sector": p.get("sector"),
                    "estimated_cost": p.get("estimated_cost"),
                    "sanctioned_cost": p.get("sanctioned_cost"),
                    "actual_expenditure": p.get("actual_expenditure"),
                    "physical_progress": p.get("physical_progress"),
                    "financial_progress": p.get("financial_progress"),
                    "status": p.get("status", "IN_PROGRESS"),
                    "priority": p.get("priority", "NORMAL"),
                    "trust_score": p.get("trust_score", 100.0),
                    "latitude": p.get("latitude"),
                    "longitude": p.get("longitude"),
                    "provenance": p.get("provenance", "OFFICIAL")
                })

            resp = httpx.post(url, json=payload, headers=cls._get_headers(), timeout=10.0)
            return resp.status_code in [200, 201, 204]
        except Exception as e:
            print(f"Error upserting projects to Supabase: {e}")
            return False

    @classmethod
    def fetch_project_full_relational(cls, project_id: str) -> Optional[Dict[str, Any]]:
        if not cls.is_configured():
            return None
        proj = cls.fetch_project_by_id(project_id)
        if not proj:
            return None
        try:
            pid = proj["id"]
            h = cls._get_headers()

            # Payments
            pay_resp = httpx.get(f"{settings.SUPABASE_URL}/rest/v1/payments?project_id=eq.{pid}&select=*", headers=h, timeout=5.0)
            payments = pay_resp.json() if pay_resp.status_code in [200, 206] else []

            # Evidence
            evid_resp = httpx.get(f"{settings.SUPABASE_URL}/rest/v1/evidence_files?project_id=eq.{pid}&select=*", headers=h, timeout=5.0)
            evidence = evid_resp.json() if evid_resp.status_code in [200, 206] else []

            # Documents
            doc_resp = httpx.get(f"{settings.SUPABASE_URL}/rest/v1/documents?project_id=eq.{pid}&select=*", headers=h, timeout=5.0)
            documents = doc_resp.json() if doc_resp.status_code in [200, 206] else []

            # Inspections
            insp_resp = httpx.get(f"{settings.SUPABASE_URL}/rest/v1/field_inspections?project_id=eq.{pid}&select=*", headers=h, timeout=5.0)
            inspections = insp_resp.json() if insp_resp.status_code in [200, 206] else []

            # Progress
            prog_resp = httpx.get(f"{settings.SUPABASE_URL}/rest/v1/progress_updates?project_id=eq.{pid}&select=*", headers=h, timeout=5.0)
            progress_updates = prog_resp.json() if prog_resp.status_code in [200, 206] else []

            return {
                "project": proj,
                "financials": {
                    "sanctioned_cost": proj.get("sanctioned_cost", 0.0),
                    "actual_expenditure": proj.get("actual_expenditure", 0.0),
                    "utilization_pct": proj.get("financial_progress", 0.0),
                    "provenance": "DERIVED FROM OFFICIAL"
                },
                "progress": {
                    "physical_progress": proj.get("physical_progress", 0.0),
                    "financial_progress": proj.get("financial_progress", 0.0),
                    "updates": progress_updates,
                    "provenance": "DERIVED FROM OFFICIAL"
                },
                "payments": payments,
                "evidence": evidence,
                "documents": documents,
                "inspections": inspections
            }
        except Exception as e:
            logger.error(f"Error fetching relational data for project {project_id} from Supabase: {e}")
            return None

    @classmethod
    def insert_mp_recommendation(cls, rec: Dict[str, Any]) -> bool:
        if not cls.is_configured():
            return False
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/mp_recommendations"
            resp = httpx.post(url, json=rec, headers=cls._get_headers(), timeout=5.0)
            return resp.status_code in [200, 201, 204]
        except Exception as e:
            logger.error(f"Supabase insert mp_recommendations error: {e}")
            return False

    @classmethod
    def update_mp_recommendation(cls, rec_id: str, updates: Dict[str, Any]) -> bool:
        if not cls.is_configured():
            return False
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/mp_recommendations?id=eq.{rec_id}"
            resp = httpx.patch(url, json=updates, headers=cls._get_headers(), timeout=5.0)
            return resp.status_code in [200, 204]
        except Exception as e:
            logger.error(f"Supabase update mp_recommendations error: {e}")
            return False

    @classmethod
    def insert_governance_decision(cls, decision: Dict[str, Any]) -> bool:
        if not cls.is_configured():
            return False
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/governance_decisions"
            resp = httpx.post(url, json=decision, headers=cls._get_headers(), timeout=5.0)
            return resp.status_code in [200, 201, 204]
        except Exception as e:
            logger.error(f"Supabase insert governance_decisions error: {e}")
            return False

    @classmethod
    def insert_project_inspection(cls, inspection: Dict[str, Any]) -> bool:
        if not cls.is_configured():
            return False
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/project_inspections"
            resp = httpx.post(url, json=inspection, headers=cls._get_headers(), timeout=5.0)
            return resp.status_code in [200, 201, 204]
        except Exception as e:
            logger.error(f"Supabase insert project_inspections error: {e}")
            return False

    @classmethod
    def insert_project_progress_update(cls, update: Dict[str, Any]) -> bool:
        if not cls.is_configured():
            return False
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/project_progress_updates"
            resp = httpx.post(url, json=update, headers=cls._get_headers(), timeout=5.0)
            return resp.status_code in [200, 201, 204]
        except Exception as e:
            logger.error(f"Supabase insert project_progress_updates error: {e}")
            return False

    @classmethod
    def insert_project_evidence(cls, evidence: Dict[str, Any]) -> bool:
        if not cls.is_configured():
            return False
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/project_evidence"
            resp = httpx.post(url, json=evidence, headers=cls._get_headers(), timeout=5.0)
            return resp.status_code in [200, 201, 204]
        except Exception as e:
            logger.error(f"Supabase insert project_evidence error: {e}")
            return False

    @classmethod
    def insert_governance_audit_log(cls, audit: Dict[str, Any]) -> bool:
        if not cls.is_configured():
            return False
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/governance_audit_logs"
            resp = httpx.post(url, json=audit, headers=cls._get_headers(), timeout=5.0)
            return resp.status_code in [200, 201, 204]
        except Exception as e:
            logger.error(f"Supabase insert governance_audit_logs error: {e}")
            return False

    @classmethod
    def fetch_mp_recommendations(cls) -> Optional[List[Dict[str, Any]]]:
        if not cls.is_configured():
            return None
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/mp_recommendations?select=*&order=created_at.desc"
            resp = httpx.get(url, headers=cls._get_headers(), timeout=5.0)
            if resp.status_code in [200, 206]:
                return resp.json()
        except Exception as e:
            logger.error(f"Error fetching mp_recommendations from Supabase: {e}")
        return None

    @classmethod
    def fetch_governance_audit_logs(cls) -> Optional[List[Dict[str, Any]]]:
        if not cls.is_configured():
            return None
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/governance_audit_logs?select=*&order=created_at.desc"
            resp = httpx.get(url, headers=cls._get_headers(), timeout=5.0)
            if resp.status_code in [200, 206]:
                return resp.json()
        except Exception as e:
            logger.error(f"Error fetching governance_audit_logs from Supabase: {e}")
        return None


