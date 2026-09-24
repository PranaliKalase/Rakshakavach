from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.data_loader import DataLoaderService

router = APIRouter()

class CopilotQueryRequest(BaseModel):
    prompt: str
    project_id: Optional[str] = None
    role: str = "MP"
    mp_name: Optional[str] = "Demo MP 013"

@router.post("/assistant/query")
def copilot_query(payload: CopilotQueryRequest):
    prompt = payload.prompt.lower()
    mp_name = payload.mp_name or "Demo MP 013"
    
    # Resolve MP summary metrics dynamically
    summary = DataLoaderService.get_mp_summary(mp_name)
    mp_projs = DataLoaderService.get_projects_filtered(role="MP", mp_name=mp_name)

    if "delayed" in prompt or "completion" in prompt or "progress" in prompt:
        delayed = [p for p in mp_projs if p.get("status") in ["IN_PROGRESS", "ASSIGNED"] and p.get("physical_progress", 0) < 50.0]
        answer = f"In your portfolio for {mp_name} ({summary['constituency_name']}), there are {len(delayed)} projects currently exhibiting timeline progress gaps requiring monitoring."
        sources = [f"Canonical Database: {len(mp_projs)} Projects for {mp_name}", "Project Progress & Milestone Engine"]
    elif "utilization" in prompt or "expenditure" in prompt or "fund" in prompt or "allocation" in prompt:
        answer = (
            f"Your current MPLADS fund utilization is {summary['my_utilization_pct']}%. "
            f"Total allocation for {summary['constituency_name']} is ₹{(summary['my_total_allocation']/100000):,.2f} Lakh, "
            f"with total expenditure of ₹{(summary['my_expenditure']/100000):,.2f} Lakh and remaining unspent balance of ₹{(summary['remaining_funds']/100000):,.2f} Lakh."
        )
        sources = [f"mp_allocations join for {mp_name}", "project_financials Canonical Records"]
    elif "verification" in prompt or "attention" in prompt or "high priority" in prompt or "priority" in prompt or "anomal" in prompt:
        high_p = [p for p in mp_projs if p.get("priority") in ["HIGH_PRIORITY", "ATTENTION"]]
        if high_p:
            p_names = ", ".join([f"{p['project_code']} ({p['work_name']})" for p in high_p[:3]])
            answer = f"There are {len(high_p)} projects requiring priority verification in your constituency: {p_names}."
        else:
            answer = f"All {len(mp_projs)} projects in your portfolio are currently operating within normal trust parameters."
        sources = ["Trust Score Engine", "Anomaly Radar Rules", "Evidence File Ledger"]
    elif "trust" in prompt or "score" in prompt:
        answer = f"Your portfolio's average trust score across {summary['total_projects']} works in {summary['constituency_name']} is {summary['average_trust_score']} / 100."
        sources = ["trust_scores.csv Canonical Dataset", "Multi-factor Trust Scoring Model"]
    else:
        answer = (
            f"Hello {mp_name}! RAKSHKAVACH Governance Copilot is active for {summary['constituency_name']}. "
            f"You have {summary['total_projects']} total projects (Recommended: {summary['my_recommended_projects']}, Completed: {summary['my_completed_projects']}, Ongoing: {summary['my_ongoing_projects']}). "
            f"Current utilization is {summary['my_utilization_pct']}% with an average trust score of {summary['average_trust_score']}."
        )
        sources = [f"Canonical MP Portfolio: {mp_name}", "MOSPI Dataset Join"]

    return {
        "answer": answer,
        "sources": sources,
        "role_context": payload.role,
        "mp_name": mp_name,
        "constituency_name": summary['constituency_name'],
        "disclaimer": "AI-generated assistance grounded on canonical MOSPI MPLADS dataset records."
    }
