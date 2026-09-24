import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.data_loader import DataLoaderService
from app.services.supabase_client import SupabaseClientService
from app.config import settings

def main():
    print("=" * 60)
    print(" RAKSHKAVACH — SUPABASE DATABASE SEEDING UTILITY")
    print("=" * 60)

    if not SupabaseClientService.is_configured():
        print("[WARNING] Supabase credentials not configured in environment or .env file.")
        print(f"Current SUPABASE_URL: {settings.SUPABASE_URL}")
        print("Please update backend/.env or root .env with your live Supabase credentials:")
        print("  SUPABASE_URL=https://<your-project-id>.supabase.co")
        print("  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>")
        print("=" * 60)
        return

    print(f"Connecting to Supabase at: {settings.SUPABASE_URL}")
    if not SupabaseClientService.test_connection():
        print("[ERROR] Failed to reach Supabase API. Check project URL and service role key.")
        return

    print("[SUCCESS] Connection established!")
    print("Loading 543 validated MOSPI project records from local dataset...")

    projects = DataLoaderService.load_dataset()
    print(f"Loaded {len(projects)} valid project records.")

    print("Uploading project records to Supabase table 'projects'...")
    success = SupabaseClientService.upsert_projects(projects)

    if success:
        print(f"[SUCCESS] Successfully seeded {len(projects)} projects to Supabase database!")
    else:
        print("[ERROR] Failed to seed projects to Supabase.")

if __name__ == "__main__":
    main()
