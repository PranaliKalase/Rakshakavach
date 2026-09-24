import { UserProfile } from '@/types/user';

export const APP_NAME = "RAKSHKAVACH";
export const APP_SUBTITLE = "AI-Powered MPLADS Verification & Trust Platform";
export const PROTOTYPE_DISCLAIMER = "Prototype decision-support platform. Built on official MOSPI MPLADS Hon'ble MP dataset.";


// Real User Profiles generated from official dataset
export const DEMO_USERS: Record<string, UserProfile> = {
  DISTRICT_AUTHORITY: {
    id: "usr-da-official",
    email: "collector.badaun@gov.in",
    fullName: "District Collector — Badaun, Uttar Pradesh",
    role: "DISTRICT_AUTHORITY",
    districtId: "dist-uttar-pradesh"
  },
  MP: {
    id: "usr-mp-official",
    email: "mp013@sansad.in",
    fullName: "Demo MP 013",
    role: "MP",
    mpName: "Demo MP 013",
    constituencyId: "C007",
    constituencyName: "Maharashtra Demo Parliamentary Constituency 13",
    districtId: "D007"
  },
  IMPLEMENTING_AGENCY: {
    id: "usr-ia-official",
    email: "pwd.up@gov.in",
    fullName: "Public Works Department (Uttar Pradesh)",
    role: "IMPLEMENTING_AGENCY",
    agencyId: "agency-uttar-pradesh",
    districtId: "dist-uttar-pradesh"
  },
  MONITORING_OFFICER: {
    id: "usr-mo-official",
    email: "inspection.mo@gov.in",
    fullName: "Field Monitoring Officer (UP Scope)",
    role: "MONITORING_OFFICER",
    districtId: "dist-uttar-pradesh"
  },
  MINISTRY: {
    id: "usr-min-official",
    email: "mplads.mospi@gov.in",
    fullName: "MOSPI Ministry Oversight Officer (New Delhi)",
    role: "MINISTRY"
  },
  ADMIN: {
    id: "usr-admin-official",
    email: "admin@rakshakavach.in",
    fullName: "System Administrator (MOSPI Technical Cell)",
    role: "ADMIN"
  }
};
