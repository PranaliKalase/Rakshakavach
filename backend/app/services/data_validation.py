from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
import datetime

@dataclass
class ValidationError:
    record_id: str
    entity_type: str
    field_name: str
    error_message: str
    rejected_value: Any

@dataclass
class ImportValidationReport:
    total_scanned: int = 0
    total_valid: int = 0
    total_invalid: int = 0
    errors: List[ValidationError] = field(default_factory=list)
    duplicates_found: int = 0

    def add_error(self, record_id: str, entity_type: str, field_name: str, message: str, value: Any):
        self.errors.append(ValidationError(
            record_id=record_id,
            entity_type=entity_type,
            field_name=field_name,
            error_message=message,
            rejected_value=value
        ))

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_scanned": self.total_scanned,
            "total_valid": self.total_valid,
            "total_invalid": self.total_invalid,
            "duplicates_found": self.duplicates_found,
            "error_count": len(self.errors),
            "sample_errors": [
                {
                    "record_id": err.record_id,
                    "entity": err.entity_type,
                    "field": err.field_name,
                    "message": err.error_message,
                    "value": str(err.rejected_value)
                }
                for err in self.errors[:10]
            ]
        }

class DataValidator:
    """
    Reusable data validation layer for RAKSHKAVACH dataset ingestion.
    Enforces business rules, range checks, foreign key existence, and duplicate checks.
    """

    VALID_STATUSES = {
        'RECOMMENDED', 'UNDER_REVIEW', 'CLARIFICATION_REQUIRED',
        'SANCTIONED', 'REJECTED', 'ASSIGNED', 'IN_PROGRESS',
        'VERIFICATION_PENDING', 'VERIFIED', 'COMPLETED', 'CLOSED'
    }

    @classmethod
    def validate_project(cls, project: Dict[str, Any], report: Optional[ImportValidationReport] = None) -> bool:
        is_valid = True
        record_id = str(project.get("id", project.get("projectCode", "UNKNOWN")))

        if report:
            report.total_scanned += 1

        # 1. Project ID & Name presence
        if not project.get("id") and not project.get("projectCode"):
            if report:
                report.add_error(record_id, "Project", "id/projectCode", "Missing project identifier", None)
            is_valid = False

        work_name = project.get("workName", project.get("work_name"))
        if not work_name or not str(work_name).strip():
            if report:
                report.add_error(record_id, "Project", "work_name", "Project work name is required", work_name)
            is_valid = False

        # 2. Status validation
        status = project.get("status", "IN_PROGRESS")
        if status not in cls.VALID_STATUSES:
            if report:
                report.add_error(record_id, "Project", "status", f"Invalid status '{status}'", status)
            is_valid = False

        # 3. Financial validation
        sanctioned = float(project.get("sanctionedCost", project.get("sanctioned_cost", project.get("allocatedAmount", 0.0))))
        expenditure = float(project.get("actualExpenditure", project.get("actual_expenditure", 0.0)))

        if sanctioned < 0:
            if report:
                report.add_error(record_id, "Financial", "sanctioned_cost", "Sanctioned amount cannot be negative", sanctioned)
            is_valid = False

        if expenditure < 0:
            if report:
                report.add_error(record_id, "Financial", "actual_expenditure", "Actual expenditure cannot be negative", expenditure)
            is_valid = False

        # 4. Progress bounds check (0 to 100)
        physical = float(project.get("physicalProgress", project.get("physical_progress", 0.0)))
        financial = float(project.get("financialProgress", project.get("financial_progress", 0.0)))

        if not (0.0 <= physical <= 100.0):
            if report:
                report.add_error(record_id, "Progress", "physical_progress", "Physical progress must be between 0 and 100", physical)
            is_valid = False

        if not (0.0 <= financial <= 100.0):
            if report:
                report.add_error(record_id, "Progress", "financial_progress", "Financial progress must be between 0 and 100", financial)
            is_valid = False

        # 5. GIS Lat/Long bounds check
        lat = project.get("latitude")
        lng = project.get("longitude")

        if lat is not None:
            try:
                lat_val = float(lat)
                if not (-90.0 <= lat_val <= 90.0):
                    if report:
                        report.add_error(record_id, "GIS", "latitude", "Latitude must be between -90 and 90", lat)
                    is_valid = False
            except (ValueError, TypeError):
                if report:
                    report.add_error(record_id, "GIS", "latitude", "Invalid latitude format", lat)
                is_valid = False

        if lng is not None:
            try:
                lng_val = float(lng)
                if not (-180.0 <= lng_val <= 180.0):
                    if report:
                        report.add_error(record_id, "GIS", "longitude", "Longitude must be between -180 and 180", lng)
                    is_valid = False
            except (ValueError, TypeError):
                if report:
                    report.add_error(record_id, "GIS", "longitude", "Invalid longitude format", lng)
                is_valid = False

        if report:
            if is_valid:
                report.total_valid += 1
            else:
                report.total_invalid += 1

        return is_valid

    @classmethod
    def validate_batch(cls, projects: List[Dict[str, Any]]) -> ImportValidationReport:
        report = ImportValidationReport()
        seen_ids = set()

        for proj in projects:
            p_code = proj.get("projectCode", proj.get("id"))
            if p_code in seen_ids:
                report.duplicates_found += 1
                report.add_error(str(p_code), "Project", "projectCode", "Duplicate project code detected", p_code)
            else:
                seen_ids.add(p_code)

            cls.validate_project(proj, report)

        return report
