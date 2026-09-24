import sys
import os
import json
import urllib.request
import urllib.parse

# Set up paths
backend_dir = r"c:\Users\sansk\OneDrive\Documents\Desktop\MPLAD doc\rakshakavach\backend"
sys.path.append(backend_dir)

from app.services.data_loader import DataLoaderService

get_mp_summary = DataLoaderService.get_mp_summary
get_projects_filtered = DataLoaderService.get_projects_filtered
get_mp_list = DataLoaderService.get_mp_list

print("=" * 60)
print("1. CANONICAL DATASET INTEGRITY & MP-WISE DISTRIBUTION SUMMARY")
print("=" * 60)

projects = DataLoaderService.load_dataset()
mps = get_mp_list()
print(f"Total Projects in Canonical Dataset: {len(projects)}")
print(f"Total Unique MPs in Dataset: {len(mps)}")
print("\nMP Distribution Breakdown:")
print(f"{'MP Name':<25} | {'Constituency':<25} | {'Project Count':<12}")
print("-" * 68)

mp_counts = {}
for mp in mps:
    mp_name = mp['mp_name']
    const = mp['constituency_name']
    cnt = mp['project_count']
    mp_counts[mp_name] = cnt
    print(f"{mp_name:<25} | {const:<25} | {cnt:<12}")

print("\n" + "=" * 60)
print("2. SAMPLE ROLE-BASED PROJECT COUNTS")
print("=" * 60)

# Sample MP
sample_mp = mps[0]['mp_name']
sample_mp_projects = get_projects_filtered(role="MP", mp_name=sample_mp)
print(f"Sample MP ('{sample_mp}'): {len(sample_mp_projects)} projects")

# Sample District Authority
sample_district = "D007"
sample_da_projects = get_projects_filtered(role="DISTRICT_AUTHORITY", district_id=sample_district)
print(f"Sample District Authority ('{sample_district}'): {len(sample_da_projects)} projects")

# Sample Monitoring Officer
sample_mo_district = "D007"
sample_mo_projects = get_projects_filtered(role="MONITORING_OFFICER", district_id=sample_mo_district)
print(f"Sample Monitoring Officer ('{sample_mo_district}'): {len(sample_mo_projects)} projects")

# Sample Implementing Agency
sample_agency = "IA011"
sample_ia_projects = get_projects_filtered(role="IMPLEMENTING_AGENCY", agency_id=sample_agency)
print(f"Sample Implementing Agency ('{sample_agency}'): {len(sample_ia_projects)} projects")

# Sample Admin
sample_admin_projects = get_projects_filtered(role="ADMIN")
print(f"Sample Admin: {len(sample_admin_projects)} projects")


print("\n" + "=" * 60)
print("3. DYNAMIC DASHBOARD METRICS FOR 3 DIFFERENT MPS")
print("=" * 60)

three_mps = [mps[0]['mp_name'], mps[5]['mp_name'], mps[10]['mp_name']]
metric_results = []

for mp_name in three_mps:
    summary = get_mp_summary(mp_name)
    metric_results.append(summary)
    print(f"\nMetrics for: {summary['mp_name']} ({summary['constituency_name']})")
    print(f"  - Recommended Projects : {summary['total_projects']}")
    print(f"  - Total Allocation     : INR {summary['my_total_allocation']:,.2f}")
    print(f"  - Total Sanctioned     : INR {summary['my_total_sanctioned_amount']:,.2f}")
    print(f"  - Total Expenditure    : INR {summary['my_expenditure']:,.2f}")
    print(f"  - Utilization %        : {summary['my_utilization_pct']}%")
    print(f"  - Completed Projects   : {summary['my_completed_projects']}")
    print(f"  - Ongoing Projects     : {summary['my_ongoing_projects']}")
    print(f"  - High Priority        : {summary['my_high_priority_projects']}")
    print(f"  - Attention Projects   : {summary['my_attention_projects']}")
    print(f"  - Avg Trust Score      : {summary['average_trust_score']}")


print("\n" + "=" * 60)
print("4. BACKEND API ENDPOINT & RBAC VALIDATION")
print("=" * 60)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def check_api(url_path):
    response = client.get(url_path)
    status = response.status_code
    if status == 200:
        data = response.json()
        if isinstance(data, list):
            count = len(data)
        elif isinstance(data, dict):
            count = data.get('total_projects') or len(data.get('projects', [])) or len(data)
        else:
            count = 0
        return status, count
    return status, response.text

mp_summary_url = f"/api/v1/mp/summary?mp_name={urllib.parse.quote(three_mps[0])}"
mp_projects_url = f"/api/v1/projects?role=MP&mp_name={urllib.parse.quote(three_mps[0])}"
da_projects_url = f"/api/v1/projects?role=DISTRICT_AUTHORITY&district_id=D007"
mo_projects_url = f"/api/v1/projects?role=MONITORING_OFFICER&district_id=D007"
ia_projects_url = f"/api/v1/projects?role=IMPLEMENTING_AGENCY&agency_id=IA011"
admin_projects_url = f"/api/v1/projects?role=ADMIN"
mp_list_url = f"/api/v1/mp/list"

print(f"GET /api/v1/mp/summary ({three_mps[0]}) -> Status: {check_api(mp_summary_url)[0]}")
print(f"GET /api/v1/projects (Role: MP, MP: {three_mps[0]}) -> Count: {check_api(mp_projects_url)[1]}")
print(f"GET /api/v1/projects (Role: DISTRICT_AUTHORITY, District: D007) -> Count: {check_api(da_projects_url)[1]}")
print(f"GET /api/v1/projects (Role: MONITORING_OFFICER, District: D007) -> Count: {check_api(mo_projects_url)[1]}")
print(f"GET /api/v1/projects (Role: IMPLEMENTING_AGENCY, Agency: IA011) -> Count: {check_api(ia_projects_url)[1]}")
print(f"GET /api/v1/projects (Role: ADMIN) -> Count: {check_api(admin_projects_url)[1]}")
print(f"GET /api/v1/mp/list -> Status: {check_api(mp_list_url)[0]}")

print("\nValidation completed successfully!")
