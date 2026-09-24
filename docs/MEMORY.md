# RAKSHKAVACH Repository Memory & Architecture State

> **Last Updated**: 2026-09-22
> **System Status**: Fully Operational (Frontend: `http://localhost:3000`, Backend API: `http://localhost:8000`)
> **Dataset Status**: Integrated Official MOSPI 543 Hon'ble MP Dataset (`Allocated Limit for Honble MPs.xlsx`)

---

## 1. System Identity & Core Philosophy
- **Application Title**: RAKSHKAVACH
- **Subtitle**: AI-Powered MPLADS Verification & Trust Platform
- **Core Governance Rule**:
  - **AI ASSISTS.**
  - **HUMANS VERIFY.**
  - **AUTHORIZED OFFICERS DECIDE.**
- **Non-Negotiable Safety Terminology**:
  - Decision-support platform only. Models produce review signals.
  - Allowed Terms: *"Requires Verification"*, *"Attention Required"*, *"Anomaly Detected"*, *"Verification Priority"*.
  - **STRICTLY FORBIDDEN**: *"Fraud Detected"*, *"Guilty"*, *"Fraud Confirmed"*, *"Corruption Detected"*.

---

## 2. Integrated Official MOSPI Dataset
- **Source File**: [Allocated Limit for Honble MPs.xlsx](file:///f:/Git%20Push%20Extract/rakshakavach/Allocated%20Limit%20for%20Honble%20MPs.xlsx)
- **JSON Dataset**: `frontend/src/lib/official_mplads_data.json` & `frontend/src/lib/constants.ts`
- **Dataset Metrics**:
  - **Total Lok Sabha MPs**: 543
  - **Total Official Allocated Limit**: ₹8,354.21 Crore
  - **States Covered**: 36 States & Union Territories (Uttar Pradesh 80 MPs, Maharashtra 49 MPs, West Bengal 42 MPs, Bihar 40 MPs, Tamil Nadu 39 MPs, Madhya Pradesh 29 MPs, Karnataka 28 MPs, Gujarat 26 MPs, Rajasthan 25 MPs, Andhra Pradesh 25 MPs, Kerala 20 MPs, Odisha 21 MPs, Telangana 17 MPs, Assam 14 MPs, Punjab 13 MPs, Chhattisgarh 11 MPs, Haryana 10 MPs, Delhi 7 MPs, Jammu & Kashmir 5 MPs, Uttarakhand 5 MPs, Himachal Pradesh 4 MPs, Tripura 2 MPs, Arunachal Pradesh 2 MPs, Goa 2 MPs, Manipur 2 MPs, Meghalaya 2 MPs, Nagaland 1 MP, Mizoram 1 MP, Sikkim 1 MP, Puducherry 1 MP, Chandigarh 1 MP, Ladakh 1 MP, A&N Islands 1 MP, DNH & DD 2 MPs, Lakshadweep 1 MP).

---

## 3. Monorepo Architecture & File Structure

```
rakshakavach/
├── .gitignore, .env.example, README.md, SECURITY.md
├── docs/                                  # 24 System & Governance Specifications
│   ├── PRD.md, ARCHITECTURE.md, DESIGN_SYSTEM.md, AI_GOVERNANCE.md, DEMO_SCRIPT.md, MEMORY.md
├── frontend/                              # Next.js 14+ App Router Frontend
│   ├── src/app/                           # App Router Pages
│   │   ├── page.tsx                       # Landing Page
│   │   ├── login/page.tsx                 # Single-User Authenticated Login Page
│   │   ├── dashboard/                     # Role Dashboards
│   │   │   ├── mp/page.tsx                # MP Portal
│   │   │   ├── district-authority/page.tsx # District Collector Portal
│   │   │   ├── implementing-agency/page.tsx # PWD Implementing Agency Portal
│   │   │   ├── monitoring-officer/page.tsx # Field Inspection Portal
│   │   │   ├── ministry/page.tsx          # MOSPI Ministry Oversight Portal
│   │   │   └── admin/page.tsx             # System Administrator Portal
│   │   ├── projects/                      # Projects Register & Recommendation Form
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [projectId]/page.tsx
│   │   ├── verification-queue/page.tsx    # Centralized Verification Queue with Modals
│   │   ├── audit-room/page.tsx            # Digital Audit Room, Passport & SHA-256 Ledger
│   │   ├── copilot/page.tsx               # Governance Copilot Q&A
│   │   ├── map/page.tsx                   # Mapbox GIS Map
│   │   └── analytics/page.tsx             # System Analytics
│   ├── src/components/                    # UI Components
│   │   ├── layout/ (AppShell, Header, Sidebar with mobile drawer toggle)
│   │   ├── ui/ (StatusBadge, KPICard, PermissionDenied 403 guard)
│   │   ├── risk/ (TrustAssessment, AnomalyRadar, ExplainableAIPanel)
│   │   ├── evidence/ (EvidencePassport, EvidenceLedger)
│   │   └── map/ (ProjectMap)
│   └── src/lib/
│       ├── constants.ts                   # Official 543 MP dataset constants & demo users
│       └── official_mplads_data.json      # Official MOSPI extracted JSON
├── backend/                               # Python FastAPI Backend API
│   ├── app/
│   │   ├── main.py, config.py
│   │   ├── ml/ (rule_engine.py, anomaly_model.py, similarity_model.py, explainability.py)
│   │   ├── api/ (health.py, projects.py, risk.py, assistant.py)
│   │   └── schemas/ (project.py, risk.py, evidence.py, inspection.py)
│   └── tests/ (test_risk_engine.py)
└── supabase/
    └── migrations/                        # 17 SQL Schema & RLS Migrations (001-017)
```

---

## 4. Security & Access Control Policy
1. **No Prototype Role Switcher**: The sidebar role dropdown has been **removed**.
2. **Single-User Login**: Users select their official account at `/login` (*Dr. Ananya Sharma - District Collector*, *Shri Aditya Yadav - MP*, *PWD Implementing Agency*, *Vikram Singh - Monitoring Officer*, *MOSPI Ministry Oversight*, *System Admin*).
3. **Role-Filtered Navigation**: Sidebar menu links are strictly generated based on `currentUser.role`.
4. **403 Route Guard**: `AppShell` evaluates route permissions and renders `<PermissionDenied userRole={currentUser.role} />` if an unauthorized user attempts accessing forbidden URLs.

---

## 5. Build, Test & Run Commands

### Backend Server & Tests
```bash
# Run FastAPI Backend Server
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Run Backend Unit Test Runner
python -c "import sys; sys.path.append('backend'); from tests.test_risk_engine import test_rule_engine_progress_mismatch, test_isolation_forest_fallback; test_rule_engine_progress_mismatch(); test_isolation_forest_fallback(); print('ALL BACKEND TESTS PASSED!')"
```

### Frontend Server & Type Check
```bash
# Run Next.js Frontend Dev Server
cd frontend
npm run dev

# Run TypeScript Compilation Check (0 Errors)
cd frontend
npx tsc --noEmit
```
