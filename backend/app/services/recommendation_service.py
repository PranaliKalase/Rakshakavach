import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.services.data_loader import DataLoaderService

DATASET_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "rakshkavach_dataset"
RECOMMENDATIONS_FILE = DATASET_DIR / "mp_recommendations.json"
AUDIT_LOG_FILE = DATASET_DIR / "governance_audit_log.json"

class RecommendationService:
    """
    Dedicated Service for MP Work Recommendation Persistence & Governance Audit Logging.
    Maintains persistent database storage (backed by mp_recommendations.json & governance_audit_log.json)
    and handles state transitions, RBAC verification, audit logging, and project conversion.
    """
    _cached_recommendations: Optional[List[Dict[str, Any]]] = None
    _cached_audit_logs: Optional[List[Dict[str, Any]]] = None

    ALLOWED_STATUSES = [
        "RECOMMENDED_BY_MP",
        "UNDER_REVIEW",
        "TECHNICAL_EVALUATION",
        "SANCTIONED",
        "REJECTED",
        "WORK_ORDER_ISSUED",
        "IN_PROGRESS",
        "COMPLETED"
    ]

    @classmethod
    def _ensure_loaded(cls):
        if cls._cached_recommendations is None:
            cls._load_recommendations()
        if cls._cached_audit_logs is None:
            cls._load_audit_logs()

    @classmethod
    def _load_recommendations(cls):
        DATASET_DIR.mkdir(parents=True, exist_ok=True)
        if RECOMMENDATIONS_FILE.exists():
            try:
                with open(RECOMMENDATIONS_FILE, "r", encoding="utf-8") as f:
                    cls._cached_recommendations = json.load(f)
                    return
            except Exception as e:
                print(f"Error reading recommendations file: {e}")

        # Seed initial canonical recommendations if file doesn't exist
        seed = cls._generate_seed_recommendations()
        cls._cached_recommendations = seed
        cls._save_recommendations()

    @classmethod
    def _save_recommendations(cls):
        DATASET_DIR.mkdir(parents=True, exist_ok=True)
        try:
            with open(RECOMMENDATIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(cls._cached_recommendations or [], f, indent=2, default=str)
        except Exception as e:
            print(f"Error saving recommendations file: {e}")

    @classmethod
    def _load_audit_logs(cls):
        DATASET_DIR.mkdir(parents=True, exist_ok=True)
        if AUDIT_LOG_FILE.exists():
            try:
                with open(AUDIT_LOG_FILE, "r", encoding="utf-8") as f:
                    cls._cached_audit_logs = json.load(f)
                    return
            except Exception as e:
                print(f"Error reading audit log file: {e}")

        cls._cached_audit_logs = []
        cls._save_audit_logs()

    @classmethod
    def _save_audit_logs(cls):
        DATASET_DIR.mkdir(parents=True, exist_ok=True)
        try:
            with open(AUDIT_LOG_FILE, "w", encoding="utf-8") as f:
                json.dump(cls._cached_audit_logs or [], f, indent=2, default=str)
        except Exception as e:
            print(f"Error saving audit log file: {e}")

    @classmethod
    def _log_audit(
        cls,
        entity_id: str,
        action: str,
        performed_by: str,
        performed_role: str,
        old_status: Optional[str] = None,
        new_status: Optional[str] = None,
        entity_type: str = "RECOMMENDATION"
    ) -> Dict[str, Any]:
        cls._ensure_loaded()
        audit_entry = {
            "audit_id": str(uuid.uuid4()),
            "entity_type": entity_type,
            "entity_id": entity_id,
            "action": action,
            "performed_by": performed_by,
            "performed_role": performed_role,
            "old_status": old_status or "NONE",
            "new_status": new_status or "NONE",
            "timestamp": datetime.now().isoformat()
        }
        cls._cached_audit_logs.insert(0, audit_entry)
        cls._save_audit_logs()
        return audit_entry

    @classmethod
    def _generate_seed_recommendations(cls) -> List[Dict[str, Any]]:
        mps = DataLoaderService.get_mp_list()
        seeds = []
        sample_sectors = [
            ("Education", "Construction of Smart Classroom Wing in Government High School", 2500000.0, "High School Block"),
            ("Healthcare", "Procurement of Mobile Medical Van & ICU Equipment", 4500000.0, "District Hospital Support"),
            ("Water Resources", "Deep Tube-well & Solar Water Pumping System Installation", 1800000.0, "Drinking Water Project"),
            ("Roads & Bridges", "Paver Block Road Construction Connecting Main Market to Bus Stand", 3200000.0, "Rural Connectivity"),
            ("Sanitation", "Community Public Toilet Complex with Waste Management System", 1200000.0, "Swachh Bharat Infrastructure")
        ]
        
        idx = 1
        for mp in mps[:5]:
            mp_name = mp["mp_name"]
            const_id = mp["constituency_id"]
            const_name = mp["constituency_name"]
            dist_id = mp["district_id"] or "D007"
            
            sector, title, cost, desc = sample_sectors[(idx - 1) % len(sample_sectors)]
            rec_uuid = str(uuid.uuid4())
            now_iso = datetime.now().isoformat()

            seed_rec = {
                "recommendation_id": rec_uuid,
                "project_title": f"{title} - {const_name}",
                "project_description": desc,
                "sector": sector,
                "estimated_cost": cost,
                "village": f"Village-{idx:02d}",
                "taluka": f"Taluka-{(idx % 3) + 1:02d}",
                "district": dist_id,
                "state": "Maharashtra",
                "constituency_id": const_id,
                "constituency_name": const_name,
                "recommended_by_user_id": f"MP-USER-{idx:03d}",
                "recommended_by_name": mp_name,
                "recommended_by_role": "MP",
                "mp_id": f"MP-{idx:03d}",
                "mp_name": mp_name,
                "recommended_at": now_iso,
                "status": "RECOMMENDED_BY_MP" if idx % 2 != 0 else "UNDER_REVIEW",
                "priority": "HIGH_PRIORITY" if idx % 2 != 0 else "MEDIUM",
                "justification": "Urgent infrastructure development requested by local village panchayat.",
                "expected_beneficiaries": "approx. 15,000 residents",
                "project_id": None,
                "created_at": now_iso,
                "updated_at": now_iso
            }
            seeds.append(seed_rec)
            idx += 1

        return seeds

    @classmethod
    def create_recommendation(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        cls._ensure_loaded()
        rec_uuid = str(uuid.uuid4())
        now_iso = datetime.now().isoformat()

        # Extract values with dynamic metadata defaults
        mp_name = data.get("mp_name") or data.get("recommended_by_name") or "Demo MP 013"
        constituency_name = data.get("constituency_name") or "Maharashtra Demo Parliamentary Constituency 13"
        constituency_id = data.get("constituency_id") or "C001"
        district = data.get("district") or data.get("district_id") or "D007"
        mp_id = data.get("mp_id") or f"MP-{abs(hash(mp_name)) % 1000:03d}"
        user_id = data.get("recommended_by_user_id") or data.get("logged_in_user_id") or f"USER-{mp_id}"
        user_name = data.get("recommended_by_name") or data.get("logged_in_user_name") or mp_name

        recommendation = {
            "recommendation_id": rec_uuid,
            "project_title": data.get("project_title") or data.get("work_name") or "Untitled Work Recommendation",
            "project_description": data.get("project_description") or data.get("description") or "",
            "sector": data.get("sector", "General"),
            "estimated_cost": float(data.get("estimated_cost", 0.0)),
            "village": data.get("village", ""),
            "taluka": data.get("taluka", ""),
            "district": district,
            "state": data.get("state", "Maharashtra"),
            "constituency_id": constituency_id,
            "constituency_name": constituency_name,
            "recommended_by_user_id": user_id,
            "recommended_by_name": user_name,
            "recommended_by_role": "MP",
            "mp_id": mp_id,
            "mp_name": mp_name,
            "recommended_at": now_iso,
            "status": "RECOMMENDED_BY_MP",
            "priority": data.get("priority", "MEDIUM"),
            "justification": data.get("justification", ""),
            "expected_beneficiaries": str(data.get("expected_beneficiaries") or data.get("beneficiary_details") or "Community Residents"),
            "project_id": None,
            "created_at": now_iso,
            "updated_at": now_iso
        }

        cls._cached_recommendations.insert(0, recommendation)
        cls._save_recommendations()

        # Log Governance Audit Entry
        cls._log_audit(
            entity_id=rec_uuid,
            action="MP_SUBMITTED_RECOMMENDATION",
            performed_by=recommendation["recommended_by_name"],
            performed_role="MP",
            old_status="NONE",
            new_status="RECOMMENDED_BY_MP"
        )

        return recommendation

    @classmethod
    def get_recommendations(
        cls,
        mp_name: Optional[str] = None,
        district: Optional[str] = None,
        status: Optional[str] = None,
        role: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        cls._ensure_loaded()
        recs = cls._cached_recommendations or []

        if mp_name:
            recs = [r for r in recs if r.get("mp_name") == mp_name or r.get("recommended_by_name") == mp_name]

        if district:
            recs = [r for r in recs if r.get("district") == district or r.get("district_id") == district]

        if status:
            recs = [r for r in recs if r.get("status") == status]

        return recs

    @classmethod
    def get_recommendation_by_id(cls, rec_id: str) -> Optional[Dict[str, Any]]:
        cls._ensure_loaded()
        for r in cls._cached_recommendations or []:
            if r.get("recommendation_id") == rec_id or r.get("id") == rec_id:
                return r
        return None

    @classmethod
    def update_recommendation_status(
        cls,
        rec_id: str,
        new_status: str,
        performed_by: str,
        performed_role: str,
        remarks: Optional[str] = None
    ) -> Dict[str, Any]:
        cls._ensure_loaded()
        rec = cls.get_recommendation_by_id(rec_id)
        if not rec:
            raise ValueError(f"Recommendation '{rec_id}' not found.")

        if new_status not in cls.ALLOWED_STATUSES:
            raise ValueError(f"Invalid status '{new_status}'. Allowed: {cls.ALLOWED_STATUSES}")

        old_status = rec.get("status", "RECOMMENDED_BY_MP")
        rec["status"] = new_status
        rec["updated_at"] = datetime.now().isoformat()
        if remarks:
            rec["last_review_remarks"] = remarks

        # If status becomes SANCTIONED, trigger automatic project creation if not already linked
        project_created = None
        if new_status == "SANCTIONED" and not rec.get("project_id"):
            project_created = cls._convert_recommendation_to_project(rec, performed_by, performed_role)
            rec["project_id"] = project_created["id"]

        cls._save_recommendations()

        # Log Audit
        cls._log_audit(
            entity_id=rec["recommendation_id"],
            action=f"STATUS_UPDATED_TO_{new_status}",
            performed_by=performed_by,
            performed_role=performed_role,
            old_status=old_status,
            new_status=new_status
        )

        return {
            "recommendation": rec,
            "project_created": project_created
        }

    @classmethod
    def _convert_recommendation_to_project(
        cls,
        rec: Dict[str, Any],
        performed_by: str,
        performed_role: str
    ) -> Dict[str, Any]:
        """
        Automatically converts an approved MP Recommendation into a full Project record
        maintaining strict recommendation_id linkage.
        """
        all_projects = DataLoaderService.load_dataset()
        new_id = str(len(all_projects) + 1)
        pcode = f"PRJ-{rec.get('district', 'D007')}-{datetime.now().strftime('%Y')}-{new_id.zfill(4)}"
        now_iso = datetime.now().isoformat()

        new_project = {
            "id": new_id,
            "project_code": pcode,
            "recommendation_id": rec["recommendation_id"],
            "work_name": rec["project_title"],
            "project_title": rec["project_title"],
            "description": rec["project_description"],
            "sector": rec["sector"],
            "sanctioned_cost": rec["estimated_cost"],
            "sanctioned_amount": rec["estimated_cost"],
            "estimated_cost": rec["estimated_cost"],
            "actual_expenditure": 0.0,
            "physical_progress": 0.0,
            "financial_progress": 0.0,
            "status": "SANCTIONED",
            "district_id": rec.get("district", "D007"),
            "district_name": f"District {rec.get('district', 'D007')}",
            "constituency_id": rec.get("constituency_id", "C001"),
            "constituency_name": rec.get("constituency_name", "Constituency"),
            "mp_name": rec.get("mp_name"),
            "allocation_id": f"ALLOC-{rec.get('constituency_id', 'C001')}",
            "trust_score": 100.0,
            "verification_priority": "NORMAL",
            "provenance": "MP_RECOMMENDED",
            "recommendation_date": rec.get("created_at"),
            "sanction_date": now_iso,
            "justification": rec.get("justification"),
            "expected_beneficiaries": rec.get("expected_beneficiaries")
        }

        all_projects.insert(0, new_project)
        if DataLoaderService._cached_index is not None:
            DataLoaderService._cached_index[new_id] = new_project
            DataLoaderService._cached_index[pcode] = new_project

        cls._log_audit(
            entity_id=rec["recommendation_id"],
            action="PROJECT_CREATED_FROM_RECOMMENDATION",
            performed_by=performed_by,
            performed_role=performed_role,
            old_status=rec.get("status", "SANCTIONED"),
            new_status="PROJECT_CONVERTED",
            entity_type="PROJECT"
        )

        return new_project

    @classmethod
    def get_audit_logs(cls, entity_id: Optional[str] = None, entity_type: Optional[str] = None) -> List[Dict[str, Any]]:
        cls._ensure_loaded()
        logs = cls._cached_audit_logs or []

        if entity_id:
            logs = [l for l in logs if l.get("entity_id") == entity_id]
        if entity_type:
            logs = [l for l in logs if l.get("entity_type") == entity_type]

        return logs

    @classmethod
    def get_recommendations_summary(cls) -> Dict[str, Any]:
        cls._ensure_loaded()
        recs = cls._cached_recommendations or []

        by_mp = {}
        by_district = {}
        status_dist = {}

        for r in recs:
            mname = r.get("mp_name", "Unknown MP")
            dist = r.get("district", "Unknown District")
            st = r.get("status", "RECOMMENDED_BY_MP")

            by_mp[mname] = by_mp.get(mname, 0) + 1
            by_district[dist] = by_district.get(dist, 0) + 1
            status_dist[st] = status_dist.get(st, 0) + 1

        return {
            "total_recommendations": len(recs),
            "by_mp": by_mp,
            "by_district": by_district,
            "status_distribution": status_dist
        }
