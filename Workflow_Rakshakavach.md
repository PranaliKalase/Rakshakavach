# Workflow_Rakshakavach

# RAKSHKAVACH — Complete Master Prompt
Copy and paste the following prompt into Antigravity, Cursor, Claude Code, Gemini, or another coding agent.

```text
You are a principal full-stack engineer, product architect, UI/UX designer, security architect and machine-learning engineer.

Build a complete prototype called:

RAKSHKAVACH

Subtitle:

AI-Powered MPLADS Verification & Trust Platform

RAKSHKAVACH is a prototype decision-support, verification, monitoring and audit platform built around the MPLADS workflow.

It is NOT a replacement for e-SAKSHI.

It is NOT an official Government of India website.

It must not use fake government logos, ministry seals, official emblems or misleading claims of government ownership.

The platform must clearly communicate:

AI ASSISTS.
HUMANS VERIFY.
AUTHORIZED OFFICERS DECIDE.

The core product journey is:

RECOMMEND
→ SANCTION
→ ASSIGN
→ EXECUTE
→ DETECT
→ VERIFY
→ EXPLAIN
→ INSPECT
→ DECIDE
→ PRESERVE
→ AUDIT

The core product philosophy is:

AI detects signals.
AI explains signals.
AI prioritizes attention.
Authorized humans verify.
Authorities make decisions.
The system preserves the record.

==================================================
1. PRIMARY OBJECTIVE
==================================================

Build a production-quality prototype that demonstrates a complete MPLADS project lifecycle.

The prototype must include:

1. Role-based authentication
2. Role-based dashboards
3. Project recommendation
4. District Authority review
5. Project sanction or rejection
6. Implementing Agency assignment
7. Progress updates
8. Financial tracking
9. Evidence upload
10. Document upload
11. AI-assisted evidence assessment
12. Rule-based anomaly detection
13. Unsupervised anomaly detection
14. Duplicate and similarity detection
15. Trust/verification assessment
16. Explainable AI
17. Verification queue
18. Monitoring Officer inspection workflow
19. Inspection report
20. Project map
21. GIS and peer benchmarking
22. Evidence Passport
23. Tamper-evident evidence ledger using cryptographic hashes
24. Digital Audit Room
25. Governance Copilot
26. Notifications
27. Admin dashboard
28. Audit logs
29. System and AI monitoring
30. Responsive states
31. Loading, empty, success, error and permission-denied states
32. Automated tests
33. Security hardening
34. Documentation

Do not create disconnected feature pages.

Every feature must connect to a specific project, project code, lifecycle status and audit history.

==================================================
2. NON-NEGOTIABLE SAFETY AND GOVERNANCE RULES
==================================================

The system is a decision-support platform.

It must never claim that an AI model has proven fraud, corruption, guilt or criminal activity.

Use the following terminology:

- Requires Verification
- Verification Priority
- Attention Required
- Anomaly Detected
- Risk Signal
- AI Assessment
- Supporting Factors
- Evidence Inconsistency
- Human Verification
- Authority Decision
- Verification Assessment
- Potentially Similar Project

Do not use these as default labels:

- Fraud Detected
- Fraud Confirmed
- Guilty
- Corruption Detected
- Criminal Activity
- Proven Misuse

AI outputs must be presented as review signals only.

Every AI result must show:

- Model name
- Model version
- Feature version
- Calculation timestamp
- Reason codes
- Affected fields
- Supporting records
- Recommended verification actions
- Human review status
- Clear limitation or disclaimer

The AI must never:

- Automatically reject a project
- Automatically sanction a project
- Automatically accuse a person
- Automatically alter official records
- Generate fake evidence
- Fabricate coordinates
- Invent project records
- Create unsupported document conclusions
- Override an authorized officer
- Hide uncertainty
- Present an anomaly as proof of wrongdoing

Use this disclosure wherever appropriate:

“AI-generated assessment for verification prioritization. Confirm information against official records before making administrative decisions.”

==================================================
3. CANONICAL PRODUCT NAME
==================================================

Use the following visible branding everywhere:

Application name:

RAKSHKAVACH

Subtitle:

AI-Powered MPLADS Verification & Trust Platform

Short subtitle where space is limited:

Verification & Trust Platform

Do not use “MPLADS Intelligence” in the visible UI.

Use RAKSHKAVACH consistently on:

- Landing page
- Login page
- Sidebar
- Header
- Dashboards
- Project pages
- Evidence pages
- Audit Room
- Governance Copilot
- Notifications
- Settings
- Empty states
- Error states
- Mobile navigation
- Browser metadata where appropriate

Add a subtle prototype disclosure:

“Prototype decision-support platform. Not an official Government of India application.”

==================================================
4. TECHNOLOGY STACK
==================================================

Frontend:

- Next.js with App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- Mapbox GL JS
- Recharts
- React Hook Form
- Zod
- Playwright
- ESLint
- Prettier

Backend:

- Python 3.11+
- FastAPI
- Pydantic
- Pydantic Settings
- PyJWT
- Supabase Python client
- Pandas
- NumPy
- scikit-learn
- GeoPandas
- Shapely
- python-multipart
- structlog
- pytest
- pytest-asyncio
- Ruff
- Black
- mypy

Database:

- Supabase PostgreSQL
- PostgreSQL extensions where required
- Row Level Security
- Restricted database grants
- Append-only audit logging

Authentication:

- Supabase Auth
- Email/password authentication for prototype
- JWT access tokens
- Refresh sessions managed by Supabase
- MFA-ready architecture for privileged roles

Authorization:

- Application RBAC
- PostgreSQL RLS
- District, constituency and agency scope restrictions
- Backend permission checks
- Deny-by-default policies

Storage:

- Supabase private Storage bucket
- Storage RLS
- Short-lived signed URLs
- File type allowlist
- Maximum file-size limits
- Malware-scanning integration point

Deployment:

- Vercel for frontend
- Render, Fly.io, AWS or approved government infrastructure for backend
- Never expose secrets in the browser
- Production deployment must be configurable for approved infrastructure

==================================================
5. REPOSITORY STRUCTURE
==================================================

Use or create the following monorepo structure:

raksha-kavach/
├── README.md
├── LICENSE
├── SECURITY.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md
├── .gitignore
├── .env.example
├── docker-compose.yml
├── Makefile
├── pnpm-workspace.yaml
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   ├── SECURITY.md
│   ├── DATA_GOVERNANCE.md
│   ├── AI_GOVERNANCE.md
│   ├── API_SPECIFICATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── RLS_MODEL.md
│   ├── STORAGE_MODEL.md
│   ├── RBAC_MATRIX.md
│   ├── DATA_IMPORT.md
│   ├── ML_MODEL_CARD.md
│   ├── TESTING_STRATEGY.md
│   ├── DEPLOYMENT.md
│   ├── DISASTER_RECOVERY.md
│   ├── INCIDENT_RESPONSE.md
│   ├── THREAT_MODEL.md
│   ├── PRIVACY.md
│   ├── ACCESSIBILITY.md
│   ├── OPERATIONS_RUNBOOK.md
│   ├── DEMO_SCRIPT.md
│   ├── ANTIGRAVITY_PROMPTS.md
│   └── MEMORY.md
│
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   ├── components.json
│   ├── middleware.ts
│   ├── public/
│   │   ├── logo.svg
│   │   └── favicon.ico
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── globals.css
│       │   ├── error.tsx
│       │   ├── not-found.tsx
│       │   ├── login/page.tsx
│       │   ├── auth/callback/route.ts
│       │   ├── dashboard/page.tsx
│       │   ├── dashboard/mp/page.tsx
│       │   ├── dashboard/district-authority/page.tsx
│       │   ├── dashboard/implementing-agency/page.tsx
│       │   ├── dashboard/monitoring-officer/page.tsx
│       │   ├── dashboard/ministry/page.tsx
│       │   ├── dashboard/admin/page.tsx
│       │   ├── projects/page.tsx
│       │   ├── projects/new/page.tsx
│       │   ├── projects/[projectId]/page.tsx
│       │   ├── projects/[projectId]/timeline/page.tsx
│       │   ├── projects/[projectId]/evidence/page.tsx
│       │   ├── projects/[projectId]/risk/page.tsx
│       │   ├── projects/[projectId]/inspection/page.tsx
│       │   ├── verification-queue/page.tsx
│       │   ├── alerts/page.tsx
│       │   ├── alerts/[alertId]/page.tsx
│       │   ├── map/page.tsx
│       │   ├── analytics/page.tsx
│       │   ├── evidence/page.tsx
│       │   ├── audit-room/page.tsx
│       │   ├── copilot/page.tsx
│       │   ├── notifications/page.tsx
│       │   ├── settings/page.tsx
│       │   └── admin/
│       │       ├── page.tsx
│       │       ├── users/page.tsx
│       │       ├── roles/page.tsx
│       │       ├── agencies/page.tsx
│       │       ├── geography/page.tsx
│       │       ├── audit-logs/page.tsx
│       │       ├── system-monitoring/page.tsx
│       │       └── security-events/page.tsx
│       │
│       ├── components/
│       │   ├── ui/
│       │   ├── layout/
│       │   ├── dashboard/
│       │   ├── projects/
│       │   ├── risk/
│       │   ├── evidence/
│       │   ├── map/
│       │   ├── alerts/
│       │   ├── audit/
│       │   ├── copilot/
│       │   └── charts/
│       │
│       ├── lib/
│       │   ├── api-client.ts
│       │   ├── constants.ts
│       │   ├── permissions.ts
│       │   ├── validations.ts
│       │   ├── formatters.ts
│       │   ├── utils.ts
│       │   ├── supabase/
│       │   │   ├── browser.ts
│       │   │   ├── server.ts
│       │   │   └── middleware.ts
│       │   └── mapbox/config.ts
│       │
│       ├── hooks/
│       │   ├── use-current-user.ts
│       │   ├── use-projects.ts
│       │   ├── use-risk.ts
│       │   ├── use-permissions.ts
│       │   └── use-notifications.ts
│       │
│       └── types/
│           ├── database.ts
│           ├── project.ts
│           ├── risk.ts
│           ├── user.ts
│           ├── evidence.ts
│           └── api.ts
│
├── backend/
│   ├── pyproject.toml
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── .env.example
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── logging_config.py
│   │   ├── dependencies/
│   │   │   ├── auth.py
│   │   │   ├── database.py
│   │   │   └── permissions.py
│   │   ├── api/
│   │   │   ├── health.py
│   │   │   ├── me.py
│   │   │   ├── projects.py
│   │   │   ├── progress.py
│   │   │   ├── evidence.py
│   │   │   ├── documents.py
│   │   │   ├── risk.py
│   │   │   ├── alerts.py
│   │   │   ├── inspections.py
│   │   │   ├── analytics.py
│   │   │   ├── imports.py
│   │   │   └── assistant.py
│   │   ├── schemas/
│   │   │   ├── common.py
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   ├── progress.py
│   │   │   ├── evidence.py
│   │   │   ├── document.py
│   │   │   ├── risk.py
│   │   │   └── inspection.py
│   │   ├── services/
│   │   │   ├── project_service.py
│   │   │   ├── progress_service.py
│   │   │   ├── evidence_service.py
│   │   │   ├── inspection_service.py
│   │   │   ├── audit_service.py
│   │   │   ├── notification_service.py
│   │   │   └── import_service.py
│   │   ├── ml/
│   │   │   ├── data_quality.py
│   │   │   ├── rule_engine.py
│   │   │   ├── features.py
│   │   │   ├── anomaly_model.py
│   │   │   ├── similarity_model.py
│   │   │   ├── geo_analysis.py
│   │   │   ├── risk_scoring.py
│   │   │   └── explainability.py
│   │   └── repositories/
│   │       ├── project_repository.py
│   │       ├── risk_repository.py
│   │       ├── evidence_repository.py
│   │       └── audit_repository.py
│   └── tests/
│       ├── test_health.py
│       ├── test_auth.py
│       ├── test_projects.py
│       ├── test_permissions.py
│       ├── test_risk_engine.py
│       ├── test_similarity.py
│       ├── test_evidence.py
│       └── test_security.py
│
├── supabase/
│   ├── config.toml
│   ├── seed.sql
│   ├── migrations/
│   │   ├── 001_extensions.sql
│   │   ├── 002_types.sql
│   │   ├── 003_master_data.sql
│   │   ├── 004_profiles.sql
│   │   ├── 005_projects.sql
│   │   ├── 006_project_history.sql
│   │   ├── 007_progress.sql
│   │   ├── 008_evidence.sql
│   │   ├── 009_documents.sql
│   │   ├── 010_risk.sql
│   │   ├── 011_alerts.sql
│   │   ├── 012_inspections.sql
│   │   ├── 013_audit_logs.sql
│   │   ├── 014_notifications.sql
│   │   ├── 015_rls.sql
│   │   ├── 016_storage.sql
│   │   └── 017_indexes.sql
│   └── tests/
│       ├── rls_projects.sql
│       ├── rls_evidence.sql
│       ├── rls_inspections.sql
│       └── rls_cross_scope.sql
│
├── data/
│   ├── sample/
│   │   ├── projects.csv
│   │   ├── agencies.csv
│   │   └── districts.csv
│   └── imports/
│
└── scripts/
    ├── bootstrap.sh
    ├── seed-demo-users.py
    ├── import-projects.py
    └── run-risk-analysis.py
```
==================================================
6. VISUAL DESIGN SYSTEM
==================================================

Create a restrained, professional, government-style interface.

Visual personality:

- Professional
- Trustworthy
- Serious
- Calm
- Accessible
- Structured
- Data-driven
- Enterprise-grade
- Modern but restrained
Do not use:

- Neon colors
- Cyberpunk styling
- Gaming dashboards
- Crypto aesthetics
- Excessive gradients
- Excessive glassmorphism
- Huge AI illustrations
- Excessive rounded cards
- Flashy animations
- Fake official government branding
Use subtle hover transitions and state changes only.

Color tokens:

Deep Government Navy: #123B63
Dark Navy: #0B253F
Primary Blue: #1D5D91
Background: #F5F7FA
Card: #FFFFFF
Border: #D9E0E7
Primary Text: #17202A
Secondary Text: #5F6B76

Status colors:

Green:

- Normal
- Verified
- Completed
- Healthy
Amber:

- Attention
- Review Required
- Pending
- Warning
Red:

- High Verification Priority
- Critical attention
- Error
- Escalated
Blue:

- Information
- Active
- In Progress
- Processing
Gray:

- Inactive
- Archived
- Not Available
- Unassigned
Never communicate status through color alone. Use:

Icon + Text + Color

Typography:

- Use a highly readable professional sans-serif font.
- Use clear numerical typography for amounts, percentages and scores.
- Avoid oversized headings.
- Maintain compact but comfortable spacing.
- Ensure WCAG-friendly contrast.
==================================================
7. APPLICATION SHELL
==================================================

Create a reusable application shell.

Desktop:

Fixed left sidebar
Top header
Scrollable main content

Sidebar:

RAKSHKAVACH
Verification & Trust Platform

MAIN

- Dashboard
- Projects
- Verification Queue
- Project Map
- Analytics
GOVERNANCE

- Evidence
- Digital Audit Room
- Governance Copilot
SYSTEM

- Notifications
- Settings
Admin users additionally see:

- User Management
- Role Management
- Geography
- Agencies
- Audit Logs
- System Monitoring
- Security Events
Sidebar footer:

- User avatar
- Full name
- Role
- District, constituency or agency
- Profile
- Logout
Header:

- Current page title
- District or constituency context
- Financial year selector
- Search
- Notifications
- Help
- User profile
The sidebar and actions must adapt to the current role.

Unauthorized routes must show a permission-denied screen and must not expose data.

==================================================
8. USER ROLES AND ACCESS
==================================================

Roles:

1. MP
2. DISTRICT_AUTHORITY
3. IMPLEMENTING_AGENCY
4. MONITORING_OFFICER
5. MINISTRY
6. ADMIN
7. PUBLIC
Responsibilities:

MP:

- Create recommendations
- View constituency projects
- Track project status
- View project map
- View approved trust assessments
- View alerts relevant to their constituency
- Use Governance Copilot within scope
District Authority:

- Review recommendations
- Review feasibility
- Sanction or reject projects
- Request additional information
- Assign implementing agencies
- Review progress
- Review evidence
- Review AI signals
- Assign inspections
- Review inspection reports
- Make authority decisions
- Access Digital Audit Room
- Use Governance Copilot
Implementing Agency:

- View assigned projects
- Update progress
- Add milestones
- Upload evidence
- Upload documents
- Respond to clarification requests
- Submit completion requests
Monitoring Officer:

- View verification queue
- View assigned inspections
- Conduct field verification
- Record physical observations
- Capture inspection evidence
- Verify location where available
- Submit inspection reports
- Request additional evidence
- Escalate cases
Ministry:

- View permitted aggregate oversight data
- Review cross-district analytics where authorized
- Review system-level verification trends
- No unauthorized editing of project records
Admin:

- Manage users
- Manage role assignments
- Manage agencies
- Manage districts and constituencies
- Configure system settings
- View audit logs
- Monitor AI services
- Monitor evidence ledger
- Review security events
Admin must not casually modify historical project or financial records.

Public:

- Only approved public fields
- No internal risk information
- No private evidence
- No investigation notes
- No internal user information
Use RBAC in the application and RLS in PostgreSQL.

Never trust a role supplied by the frontend.

==================================================
9. PROJECT LIFECYCLE
==================================================

Implement the lifecycle:

RECOMMENDED
→ UNDER_REVIEW
→ SANCTIONED or REJECTED
→ ASSIGNED
→ IN_PROGRESS
→ VERIFICATION_PENDING
→ VERIFIED
→ COMPLETED
→ CLOSED

The UI must display a reusable lifecycle timeline:

- Recommended
- Under Review
- Sanctioned
- Assigned
- Execution
- Verification
- Completed
- Closed
Every lifecycle transition must:

- Validate the current status
- Validate the user role
- Validate jurisdiction
- Require remarks where appropriate
- Create an audit event
- Create a status history entry
- Create a notification where appropriate
- Never overwrite previous history
Valid actions:

MP:

- Create recommendation
- Save draft
- Submit recommendation
District Authority:

- Start review
- Request information
- Sanction
- Reject
- Assign agency
- Request verification
- Review inspection
- Close project where permitted
Implementing Agency:

- Update progress
- Upload evidence
- Submit completion request
Monitoring Officer:

- Start inspection
- Submit inspection
- Request more evidence
- Escalate
==================================================
10. LANDING PAGE
==================================================

Create a polished landing page.

Hero heading:

RAKSHKAVACH

Hero subtitle:

AI-Powered MPLADS Verification & Trust Platform

Supporting text:

“Detect anomalies, verify evidence, explain risk signals and preserve an auditable project history.”

Primary button:

Sign In

Secondary button:

Explore Platform

Show workflow:

Recommend
→ Verify
→ Detect
→ Explain
→ Preserve
→ Act

Feature cards:

- Trust Assessment
- Anomaly Radar
- AI Evidence Verification
- Document Cross Verification
- GIS and Peer Benchmarking
- Evidence Passport
- Tamper-Evident Ledger
- Governance Copilot
- Digital Audit Room
- Explainable AI
Add sections:

- How It Works
- Role-Based Governance
- AI-Assisted Verification
- Evidence Integrity
- Digital Audit Room
Include a visible prototype disclosure:

“Prototype decision-support platform. Not an official Government of India application.”

==================================================
11. LOGIN AND AUTHENTICATION
==================================================

Create a professional login page with:

- RAKSHKAVACH branding
- Email field
- Password field
- Sign In button
- Forgot Password
- Authentication error state
- Loading state
- Session-expired state
Flow:

Authentication
→ Load Profile
→ Determine Role
→ Validate Active Status
→ Validate Scope
→ Redirect to Role Dashboard

If the user has no profile or no role:

Show:

“Your account has not been assigned an application role. Contact an administrator.”

Do not expose any dashboard.

Use Supabase Auth.

Never place the service-role key in frontend code or frontend environment variables.

==================================================
12. ROLE DASHBOARDS
==================================================

Create separate, role-specific dashboards using the same design system.

---

## 12.1 MP DASHBOARD
Heading:

Constituency Overview

KPIs:

- Total Projects
- Recommended
- Active
- Completed
- Funds Utilized
- Projects Requiring Attention
Sections:

- Constituency Overview
- Project Map
- Project Status Overview
- Recent Projects
- Financial Overview
- Alerts
- Constituency Insights
Primary CTA:

Recommend New Work

Secondary CTA:

View All Projects

Use simple AI language. Do not overwhelm the MP with technical model details.

Example insight:

“28 projects are progressing normally. 4 projects require additional verification.”

---

## 12.2 DISTRICT AUTHORITY DASHBOARD
Heading:

District Monitoring Overview

Subheading:

“Project implementation, verification and governance insights.”

KPIs:

- Total Projects
- Under Review
- Sanctioned
- Assigned
- Active Works
- Verification Priority
- Completed
- Pending Actions
- Sanctioned Amount
- Expenditure
Main content:

Large left section:

- Project Map
Right section:

- Verification Queue
Below:

- Recommendation Review Queue
- Project Implementation Overview
- Financial Overview
- AI Insights
- Recent Activity
Project implementation stages:

- Recommended
- Sanctioned
- Assigned
- Under Progress
- Completed
Verification queue columns:

- Project
- Project Code
- Reason
- Priority
- Trust Assessment
- Status
- Assigned Officer
- Action
Possible reasons:

- Timeline deviation
- Evidence incomplete
- Expenditure deviation
- Document mismatch
- Missing required record
- Location inconsistency
- Stale progress update
Action buttons:

- Review
- View Explanation
- Assign Inspection
- Open Audit Room
---

## 12.3 MONITORING OFFICER DASHBOARD
Heading:

Field Verification

KPIs:

- Assigned Inspections
- Priority Inspections
- Pending Reports
- Completed Inspections
Main feature:

AI-Prioritized Inspection Queue

Each queue item includes:

- Project name
- Project code
- Location
- Verification priority
- Reason
- Last inspection
- Action
Primary action:

Start Inspection

Also show:

- Inspection Map
- Recent Inspection Reports
- Pending Evidence Requests
---

## 12.4 IMPLEMENTING AGENCY DASHBOARD
Heading:

Assigned Works

KPIs:

- Assigned Projects
- Active Projects
- Evidence Pending
- Progress Pending
- Completion Pending
Project table:

- Project
- Project Code
- Location
- Progress
- Evidence
- Documents
- Status
- Action
Actions:

- View Project
- Update Progress
- Upload Evidence
- Upload Document
- Respond to Verification
- Submit Completion
---

## 12.5 ADMIN DASHBOARD
Heading:

System Administration

KPIs:

- Total Users
- Active Projects
- Verification Alerts
- Audit Events
- Security Events
System health cards:

- Authentication
- Database
- Storage
- AI Services
- OCR Service
- Evidence Ledger
- Governance Copilot
Status values:

- Healthy
- Warning
- Unavailable
- Processing
Admin modules:

- User Management
- Role Management
- District Management
- Constituency Management
- Agency Management
- Audit Logs
- AI/ML Monitoring
- Security Events
- System Configuration
==================================================
13. MP RECOMMENDATION FLOW
==================================================

Create a professional recommendation form.

Fields:

- Work Name
- Description
- District
- Constituency
- Sector
- Estimated Cost
- Latitude
- Longitude
- Expected Completion Date
- Remarks
Actions:

- Submit Recommendation
- Save Draft
- Cancel
Validation:

- User must be authenticated
- User must have MP role
- Constituency must match user scope
- District must be valid
- Estimated cost must be non-negative
- Coordinates must be valid if provided
- Text must be trimmed
- Required fields must be present
- Project code must be generated by the server
After submission:

Status:

RECOMMENDED

Recommendation status:

SUBMITTED

Show:

- Generated project code
- Submission timestamp
- Next step: District Authority review
- Link to project details
==================================================
14. DISTRICT AUTHORITY REVIEW
==================================================

Create a project review page showing:

- Project Overview
- Recommendation
- Feasibility
- Location
- Estimated Cost
- Documents
- Financial Information
- Timeline
- Audit History
Actions:

- Review Feasibility
- Sanction Project
- Reject Project
- Request Additional Information
Requirements:

- Sanction requires confirmation
- Rejection requires a reason
- Additional information request requires remarks
- Every action creates an audit event
- Invalid transitions must be blocked
- The frontend must not be the only authorization layer
Status transitions:

RECOMMENDED → UNDER_REVIEW
UNDER_REVIEW → SANCTIONED
UNDER_REVIEW → REJECTED
UNDER_REVIEW → CLARIFICATION_REQUIRED

==================================================
15. AGENCY ASSIGNMENT
==================================================

For sanctioned projects, create an assignment interface.

Show:

- Project
- Project code
- District
- Sector
- Sanctioned amount
- Eligible agencies
- Assignment date
- Assigned by
The agency selector must show only agencies valid for the relevant district and sector.

After assignment:

SANCTIONED → ASSIGNED

Require confirmation and assignment remarks.

==================================================
16. PROJECT DETAILS PAGE
==================================================

Create one reusable project details page.

Header:

- Project name
- Project code
- Status badge
- Verification priority
- Trust assessment
- Role-appropriate actions
Tabs:

- Overview
- Progress
- Evidence
- Documents
- Financial
- Verification
- Map
- Audit
Overview sections:

- Project Information
- District
- Constituency
- Sector
- Implementing Agency
- Estimated Cost
- Sanctioned Cost
- Actual Expenditure
- Physical Progress
- Financial Progress
- Expected Completion
- Current Status
Timeline:

- Recommended
- Under Review
- Sanctioned
- Assigned
- Execution
- Verification
- Completed
- Closed
Actions must be role-aware.

==================================================
17. PROGRESS MANAGEMENT
==================================================

Create a progress management screen.

Fields:

- Physical Progress
- Financial Progress
- Milestone
- Remarks
- Expected Completion Date
- Actual Expenditure
Requirements:

- Physical progress must be between 0 and 100
- Financial progress must be between 0 and 100
- Expenditure must be non-negative
- Historical progress records must never be overwritten
- Each update must include user and timestamp
- Each update must create an audit event
- Each update must trigger risk recalculation
- Only authorized agencies may update execution data
Display:

- Current progress
- Progress timeline
- Previous updates
- Updated by
- Updated at
- Milestone
- Remarks
Example timeline:

10% → 25% → 40% → 65% → 100%

==================================================
18. EVIDENCE MANAGEMENT
==================================================

Create a secure evidence management system.

Evidence types:

- Sanction Document
- Estimate Document
- Work Order
- Progress Photograph
- Completion Photograph
- Inspection Photograph
- Inspection Report
- Expenditure Document
- Completion Certificate
- Supporting Record
- Location Evidence
Every evidence record must contain:

- Evidence ID
- Project ID
- Evidence type
- Original filename
- Safe storage path
- Uploaded by
- Upload timestamp
- MIME type
- File size
- Location if available
- Capture timestamp if available
- SHA-256 hash
- Verification status
- Integrity status
- Processing status
- Audit history
Actions:

- View
- Preview
- Verify
- Download if authorized
- View History
- Add Verification Note
Storage rules:

- Bucket must be private
- Never expose public storage URLs
- Generate signed URLs after authorization
- Validate content type
- Validate file extension
- Enforce maximum file size
- Use safe generated filenames
- Prevent path traversal
- Add malware-scanning integration point
- Store immutable metadata
- Log uploads and downloads
==================================================
19. AI EVIDENCE AND PHOTO VERIFICATION
==================================================

Create an AI-assisted evidence verification interface.

Flow:

Upload Photo
→ Validate Metadata
→ Process Image
→ Load Project Context
→ AI Assessment
→ Explain Result
→ Human Verification

Show:

- Image preview
- Project name
- Project code
- Expected location
- Submitted location
- Timestamp
- Metadata completeness
- AI assessment
- Confidence or signal where appropriate
- Verification status
- Supporting factors
- Human review action
Possible outputs:

“Evidence appears consistent with the available project context.”

“Evidence requires verification because location metadata is unavailable.”

“Evidence requires verification because submitted metadata differs from the project record.”

Do not claim that an image alone proves wrongdoing.

==================================================
20. DOCUMENT-PORTAL CROSS VERIFICATION
==================================================

Create a document verification interface.

Flow:

Upload Document
→ OCR
→ Extract Fields
→ Compare with Project Record
→ Match or Mismatch
→ Explain

Show side-by-side comparison:

DOCUMENT

- Amount
- District
- Work Name
- Date
- Agency
- Project Code
PORTAL RECORD

- Amount
- District
- Work Name
- Date
- Agency
- Project Code
Status indicators:

- Match
- Partial Match
- Mismatch
- Unable to Verify
- Pending OCR
For mismatches, show:

- Exact field
- Document value
- Portal value
- Difference
- Recommended verification action
OCR results must be treated as extracted data, not unquestionable truth.

==================================================
21. TRUST / VERIFICATION ASSESSMENT
==================================================

Create a strong but responsible Trust Assessment component.

Example:

78 / 100

Label:

Verification Assessment

Do not call it “Fraud Score.”

Factors:

- Financial Consistency
- Timeline Consistency
- Evidence Completeness
- Document Consistency
- Peer Benchmark
- Location Consistency
Each factor must show:

- Factor name
- Score or assessment
- Contribution
- Status
- Explanation
- Supporting records
- Last calculated timestamp
Include:

- Overall score
- Trend
- Model version
- View Explanation
- View Supporting Records
Use careful language:

“This score helps prioritize verification. It is not proof of wrongdoing.”

==================================================
22. MULTI-FACTOR ANOMALY RADAR
==================================================

Create a dedicated Anomaly Radar component.

Factors:

- Financial
- Timeline
- Evidence
- Documents
- Progress
- Geospatial
- Peer Benchmark
Display levels:

- Normal
- Attention
- High Verification Priority
Example:

Financial — High
Timeline — Normal
Evidence — Medium
Documents — Attention
Progress — Normal
Geospatial — Not Available
Peer Benchmark — Attention

Use progress bars, bars or radar visualization, but maintain accessibility.

Never use “Fraud Detected” as the default status.

Use:

- Requires Verification
- Attention Required
- High Verification Priority
==================================================
23. RULE ENGINE
==================================================

Implement deterministic rules for:

- Invalid physical progress
- Invalid financial progress
- Financial progress substantially ahead of physical progress
- Expenditure above sanctioned amount
- Delayed completion
- Missing required evidence
- Missing coordinates where location is required
- Missing required dates
- Stale progress update
- Missing completion document
- Document field mismatch
- Potential duplicate project
- Unusually high or low peer deviation
Every finding must include:

- Code
- Severity
- Human-readable message
- Affected field
- Source record
- Recommended verification action
- Created timestamp
Example reason codes:

- INVALID_PHYSICAL_PROGRESS
- INVALID_FINANCIAL_PROGRESS
- PROGRESS_MISMATCH
- EXPENDITURE_OVER_SANCTION
- DELAY
- EVIDENCE_GAP
- MISSING_LOCATION
- STALE_UPDATE
- DOCUMENT_MISMATCH
- POTENTIAL_DUPLICATE
- PEER_DEVIATION
==================================================
24. ISOLATION FOREST
==================================================

Implement an unsupervised Isolation Forest model.

The model must not be described as a fraud classifier.

Initial features:

- estimated_cost
- sanctioned_cost
- actual_expenditure
- physical_progress
- financial_progress
- project_duration_days
- evidence_count
- agency_project_count
- district_project_count
- sector_project_count
Requirements:

- Clean invalid inputs
- Handle missing values
- Standardize numerical features
- Make contamination configurable
- Store model version
- Store feature version
- Store feature values used
- Store calculation timestamp
- Store normalized anomaly score
- Return explainable rule findings separately
- Add fallback behavior if the model is not trained
- Add unit tests
If insufficient training data exists:

- Clearly show “Model unavailable”
- Do not generate fabricated scores
- Fall back to deterministic rules
- Explain the limitation
==================================================
25. DUPLICATE AND SIMILARITY DETECTION
==================================================

Implement potential duplicate detection using:

- TF-IDF
- Cosine similarity
- Normalized work name
- Description
- Sector
- District
- Constituency
- Geographic distance where coordinates exist
Output:

- Project ID
- Matched project ID
- Text similarity
- Geographic similarity
- Combined similarity
- Reason
- Review status
- Model version
- Calculation timestamp
Use the label:

“Potentially Similar Project”

Never use:

“Fraudulent Duplicate”

==================================================
26. GIS AND PEER BENCHMARKING
==================================================

Create a reusable Mapbox map.

Map behavior:

- Show only projects with valid coordinates
- Never fabricate coordinates
- Display marker status
- Display verification priority
- Display category
- Display expenditure where authorized
- Open project summary on marker click
Marker summary:

- Project name
- Project code
- Status
- Estimated cost
- District
- Constituency
- Progress
- Verification assessment
- View Project button
Map filters:

- District
- Constituency
- Sector
- Status
- Financial Year
- Verification Priority
States:

- Loading
- No projects
- No coordinates
- Error
- Permission denied
Peer benchmarking must consider relevant context.

Show:

- Current project
- Comparable project group
- Benchmark range
- Current value
- Deviation
- Explanation
- Data timestamp
Do not compare unrelated projects without explaining the comparison scope.

==================================================
27. EXPLAINABLE AI PANEL
==================================================

Create a component titled:

Why does this project require attention?

Example introductory text:

“The system identified 3 factors requiring additional verification.”

Each factor should show:

- Factor name
- Explanation
- Severity
- Affected field
- Supporting evidence
- Supporting record
- View Evidence action
- View Record action
- View Source action
- Recommended verification action
Example factors:

Timeline deviation:

“Reported physical progress is lower than expected for the elapsed project duration.”

Expenditure pattern:

“Recorded expenditure differs from the configured benchmark for comparable works.”

Evidence completeness:

“Required progress evidence is currently incomplete.”

Document consistency:

“One extracted document field differs from the project record.”

This must be understandable to non-technical officers.

Do not make it look like a chatbot.

==================================================
28. VERIFICATION QUEUE
==================================================

Create a centralized verification queue.

Columns:

- Project
- Project Code
- District
- Trust Assessment
- Priority
- Primary Signal
- Last Updated
- Assigned Officer
- Status
- Action
Filters:

- Priority
- District
- Project status
- Anomaly type
- Date
- Trust assessment
- Assigned officer
Actions:

- View Project
- View Explanation
- Assign Inspection
- Request Evidence
- Open Audit Room
- Clear Alert
- Escalate
Priority represents verification need, not an accusation.

==================================================
29. FIELD INSPECTION WORKFLOW
==================================================

Create a monitoring officer inspection workflow.

Show:

- Project information
- Expected location
- Map
- Observed location if available
- Location match
- Current progress
- Uploaded evidence
- Documents
- AI assessment
- Verification factors
- Previous inspections
Inspection form:

- Actual physical progress
- Observed condition
- Location verified
- Evidence collected
- Site photograph
- Officer remarks
- Verification result
Options:

- Verified
- Requires Further Evidence
- Requires Correction
- Escalate for Review
Actions:

- Submit Inspection
- Request Additional Evidence
- Escalate
- Save Draft
Every submitted inspection must create:

- Inspection record
- Audit event
- Notification
- Evidence association where applicable
==================================================
30. INSPECTION REPORT
==================================================

Create a structured inspection summary.

Include:

- Project
- Project code
- Officer
- Role
- Date
- Location
- AI assessment
- Verification factors
- Field observation
- Actual physical progress
- Evidence
- Photographs
- Remarks
- Verification result
- Supporting records
- Digital signature or acknowledgment integration point
The report must be suitable for inclusion in the Digital Audit Room.

==================================================
31. DIGITAL AUDIT ROOM
==================================================

Create one of the strongest screens in the application.

Heading:

Digital Audit Room

Purpose:

“Complete digital case file for the project.”

Sections:

- Project Summary
- Recommendation
- Feasibility
- Sanction
- Agency Assignment
- Progress History
- Financial Records
- Documents
- Evidence
- GIS Information
- Peer Benchmark
- Trust Assessment
- Anomaly Radar
- Explainable AI
- Monitoring Inspection
- Authority Decisions
- Audit Logs
- Evidence Integrity
Actions:

- Generate Audit Summary
- Export Audit Package
- View Evidence Chain
- Print or download where authorized
The timeline must show the full history of the project.

No event may be silently removed or modified.

==================================================
32. EVIDENCE PASSPORT
==================================================

Create an Evidence Passport interface.

Example:

Evidence ID:
EV-2026-000142

Project:
MPLADS-2026-A1B2C3

Type:
Progress Photograph

Uploaded By:
Implementing Agency

Timestamp:
Date and time

Location:
GPS coordinates where available

SHA-256:
Hash value

Integrity:
Verified

Verification Status:
Reviewed / Pending / Requires Verification

History:

Uploaded
→ Processed
→ Reviewed
→ Verified
→ Included in Audit Room

Use a shield or check icon with descriptive text.

==================================================
33. TAMPER-EVIDENT EVIDENCE LEDGER
==================================================

Create a ledger visualization based on cryptographic hashes.

Show:

- Evidence entry number
- Evidence ID
- SHA-256 hash
- Timestamp
- Uploader
- Previous hash
- Integrity status
Example:

Evidence Entry 001
↓
SHA-256 Hash A

Evidence Entry 002
↓
SHA-256 Hash B

Evidence Entry 003
↓
SHA-256 Hash C

Display this explanatory text:

“Cryptographic hashes help detect unexpected changes to recorded evidence.”

Do not call this blockchain unless blockchain is actually implemented.

==================================================
34. GOVERNANCE COPILOT
==================================================

Create a governance-oriented assistant.

Title:

Governance Copilot

Subtitle:

Ask questions about authorized projects, verification and supporting records.

Do not make it look like a generic consumer chatbot.

Suggested prompts:

- Which projects require verification?
- Why is this project prioritized?
- Show projects with incomplete evidence.
- Summarize this project’s audit history.
- Which projects have document inconsistencies?
- Show project expenditure against comparable projects.
Each response must display:

- Answer
- Supporting records
- Relevant project
- Data timestamp
- Sources or records used
- Confidence or limitation where applicable
The Copilot must:

- Respect user permissions
- Query only authorized data
- Never invent project data
- Never reveal private records without authorization
- Say when data is unavailable
- Say when the answer requires human confirmation
Include this disclaimer:

“AI-generated assistance. Verify information against official records before making administrative decisions.”

==================================================
35. NOTIFICATIONS
==================================================

Create role-aware notifications.

Categories:

- Project Updates
- Verification
- Evidence
- Documents
- Inspections
- System
- Security
Examples:

MP:

“Your recommendation has been submitted.”

District Authority:

“New project recommendation requires review.”

Implementing Agency:

“Project assigned to your agency.”

Implementing Agency:

“Evidence required for Project MPLADS-2026-A1B2C3.”

Monitoring Officer:

“Project MPLADS-2026-A1B2C3 has been prioritized for field verification.”

District Authority:

“Inspection report submitted for Project MPLADS-2026-A1B2C3.”

Each notification includes:

- Read/unread status
- Priority
- Timestamp
- Related project
- Action link
==================================================
36. ANALYTICS DASHBOARD
==================================================

Create simple, report-friendly analytics.

Financial analytics:

- Sanctioned amount
- Expenditure
- Utilization
- Expenditure by sector
- Expenditure over time
Project analytics:

- Recommended
- Under Review
- Sanctioned
- Assigned
- Active
- Completed
- Closed
Verification analytics:

- Verification priority
- Evidence gaps
- Document mismatches
- Inspection outcomes
- Open alerts
- Cleared alerts
Geographic analytics:

- Projects by district
- Projects by constituency
- Project distribution
- Mapped versus unmapped projects
AI analytics:

- Trust assessment distribution
- Anomaly categories
- Verification outcomes
- Model processing volume
- Model errors
Use accessible charts with legends, labels and text summaries.

==================================================
37. ADMIN SYSTEM MONITORING
==================================================

Show system status for:

- Authentication
- Database
- Storage
- AI Engine
- OCR Service
- Evidence Verification
- Governance Copilot
- Vector Search if implemented
- Notification Service
Status values:

- Healthy
- Warning
- Unavailable
- Processing
Also show:

- AI processing logs
- Model version
- Feature version
- Last successful run
- Processing errors
- Queue depth
- Processing latency
==================================================
38. AUDIT LOGS
==================================================

Create an append-only audit log interface.

Columns:

- User
- Role
- Action
- Project
- Timestamp
- Previous state
- New state
- Request ID
- IP metadata where appropriate
- Reason or remarks
Examples:

- Project Recommended
- Project Reviewed
- Project Sanctioned
- Project Rejected
- Agency Assigned
- Progress Updated
- Evidence Uploaded
- Document Processed
- Inspection Submitted
- Decision Recorded
- Alert Resolved
- Alert Escalated
Audit records must not be editable through normal UI workflows.

==================================================
39. DATABASE DESIGN
==================================================

Create migrations for:

- Extensions
- Enums
- States
- Districts
- Constituencies
- Agencies
- Profiles
- Projects
- Project status history
- Project recommendations
- Project assignments
- Progress updates
- Evidence files
- Evidence verification records
- Evidence ledger entries
- Documents
- Document extraction results
- Risk scores
- Anomaly findings
- Similar project candidates
- Alerts
- Inspections
- Inspection evidence
- Notifications
- Audit logs
- Import batches
Use:

- UUID primary keys
- Foreign keys
- Check constraints
- Unique constraints
- Created and updated timestamps
- Useful indexes
- Soft-delete only where appropriate
- Append-only history tables
- Restricted grants
- RLS on every exposed table
Enable RLS for every public table exposed through Supabase.

Do not rely on frontend checks alone.

==================================================
40. RLS AND AUTHORIZATION REQUIREMENTS
==================================================

Authorization must be enforced in three places:

1. Frontend route and component visibility
2. FastAPI backend permission checks
3. PostgreSQL RLS
Scope rules:

MP:

- Constituency-scoped project access
District Authority:

- District-scoped project access
Implementing Agency:

- Agency-assigned project access
Monitoring Officer:

- Assigned inspection and authorized project access
Ministry:

- Explicitly permitted aggregate or cross-district access
Admin:

- Administrative access based on explicit policy
Public:

- Approved public fields only
Add SQL tests for:

- Own profile access
- Admin profile access
- MP constituency scope
- District Authority district scope
- Implementing Agency agency scope
- Monitoring Officer assignment scope
- Ministry scope
- Public restrictions
- Cross-district denial
- Cross-agency denial
- Unauthorized evidence download denial
- Unauthorized inspection access denial
- Unauthorized update denial
- Unauthorized deletion denial
Use deny-by-default behavior.

==================================================
41. STORAGE SECURITY
==================================================

Create a private bucket:

project-evidence

Requirements:

- Private bucket
- Storage RLS
- Project-scoped paths
- Secure generated filenames
- File extension allowlist
- MIME-type validation
- Maximum file size
- Signed URLs only
- Authorization before download
- Malware scanning integration point
- Immutable evidence metadata
- Hash generation
- Upload audit event
- Download audit event
- Verification history
Never expose:

- Service-role key
- Raw private storage URLs
- Internal credentials
- Database credentials
- API keys
==================================================
42. API ENDPOINTS
==================================================

Implement these endpoints:

GET /api/v1/health
GET /api/v1/me

GET /api/v1/projects
POST /api/v1/projects
GET /api/v1/projects/{project_id}
PATCH /api/v1/projects/{project_id}

POST /api/v1/projects/{project_id}/review
POST /api/v1/projects/{project_id}/sanction
POST /api/v1/projects/{project_id}/reject
POST /api/v1/projects/{project_id}/request-information
POST /api/v1/projects/{project_id}/assign

GET /api/v1/projects/{project_id}/progress
POST /api/v1/projects/{project_id}/progress

GET /api/v1/projects/{project_id}/evidence
POST /api/v1/projects/{project_id}/evidence
GET /api/v1/evidence/{evidence_id}/signed-url
POST /api/v1/evidence/{evidence_id}/verify

GET /api/v1/projects/{project_id}/documents
POST /api/v1/projects/{project_id}/documents
POST /api/v1/documents/{document_id}/process
GET /api/v1/documents/{document_id}/comparison

GET /api/v1/risk/projects
GET /api/v1/projects/{project_id}/risk
POST /api/v1/projects/{project_id}/risk/recalculate

GET /api/v1/alerts
GET /api/v1/alerts/{alert_id}
POST /api/v1/alerts/{alert_id}/assign
POST /api/v1/alerts/{alert_id}/resolve
POST /api/v1/alerts/{alert_id}/escalate

GET /api/v1/inspections
POST /api/v1/projects/{project_id}/inspections
GET /api/v1/inspections/{inspection_id}

GET /api/v1/analytics/overview
GET /api/v1/analytics/financial
GET /api/v1/analytics/verification

GET /api/v1/notifications
POST /api/v1/notifications/{notification_id}/read

GET /api/v1/audit/projects/{project_id}
GET /api/v1/audit/projects/{project_id}/export

POST /api/v1/imports/projects
GET /api/v1/imports/{import_batch_id}

POST /api/v1/assistant/project
POST /api/v1/assistant/query

```

Every endpoint must:

- Validate the JWT
- Load the authenticated profile
- Check active status
- Check role
- Check jurisdiction
- Respect RLS
- Validate request data
- Return structured errors
- Add request IDs
- Add audit events for mutations

==================================================
43. ENVIRONMENT CONFIGURATION
==================================================

Create safe environment templates.

Root `.env.example`:

PROJECT_NAME=raksha-kavach

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key

DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres

MAPBOX_ACCESS_TOKEN=your-mapbox-public-token

NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-public-token

CORS_ORIGINS=http://localhost:3000
ENVIRONMENT=development
LOG_LEVEL=INFO

AI_PROVIDER=none
GEMINI_API_KEY=

Rules:

- Never expose SUPABASE_SERVICE_ROLE_KEY to the browser
- Do not prefix service secrets with NEXT_PUBLIC_
- Do not commit real environment files
- Do not hardcode secrets
- Validate required environment variables at startup
- Fail safely if secrets are missing
- Use separate development and production environments

==================================================
44. FRONTEND REQUIREMENTS
==================================================

Use:

- Server Components by default
- Client Components only where interactivity is required
- React Hook Form
- Zod validation
- Accessible form labels
- Reusable UI components
- Reusable status badges
- Reusable project tables
- Reusable timeline components
- Reusable evidence cards
- Reusable map components
- Reusable chart components
- Error boundaries
- Loading skeletons
- Empty states
- Permission-denied states

Create shared components:

- AppShell
- Sidebar
- Header
- Breadcrumbs
- KPI Card
- Status Badge
- Project Card
- Project Table
- Filter Bar
- Search Bar
- Lifecycle Timeline
- Progress History
- Map Card
- Verification Queue
- Trust Assessment
- Anomaly Radar
- Risk Factor
- Explainable AI Panel
- Evidence Card
- Evidence Passport
- Evidence Ledger
- Document Comparison
- Inspection Form
- Audit Timeline
- Activity Feed
- Notification Panel
- Confirmation Dialog
- Empty State
- Loading State
- Error State
- Permission Denied State

==================================================
45. RESPONSIVE DESIGN
==================================================

Desktop:

- Full sidebar
- Two-column command center layouts
- Large maps and tables

Tablet:

- Collapsible sidebar
- Responsive cards
- Horizontally scrollable tables where necessary
- Preserve important information hierarchy

Mobile:

- Drawer or bottom navigation
- Stacked KPI cards
- Mobile-friendly forms
- Responsive tables
- Project cards instead of dense tables where appropriate
- Sticky primary actions where useful

Do not simply shrink the desktop layout.

Maintain usability at all sizes.

==================================================
46. ACCESSIBILITY
==================================================

Follow accessible government-service design principles.

Requirements:

- High color contrast
- Proper labels
- Keyboard navigation
- Visible focus states
- Semantic headings
- ARIA labels where needed
- Meaningful icons
- Icons must not be the only status indicator
- Status must include text
- Clear validation errors
- Large enough touch targets
- No tiny text
- Reduced motion support
- No essential information conveyed only through color
- Accessible charts with text summaries
- Accessible dialogs
- Accessible tables

==================================================
47. DESIGN STATES
==================================================

Every page must implement:

- Loading state
- Empty state
- Error state
- Success state
- Permission-denied state
- No-data state
- No-coordinates state
- No-evidence state
- Processing state
- Offline or network-error state where appropriate

Never show a blank white screen.

Example empty states:

“No projects have been recorded yet.”

“No verification cases are currently assigned.”

“No evidence has been uploaded.”

“No mapped projects are currently available.”

“AI analysis is not available because there is insufficient data.”

==================================================
48. DEMO DATA RULES
==================================================

Do not populate the interface with unlabelled fake records.

If demo data is required:

- Clearly label it as DEMO DATA
- Use fictional names
- Use fictional project codes
- Avoid real government identities
- Do not use fabricated evidence as if it were official evidence
- Do not fabricate real project locations
- Mark demonstration images as sample images
- Keep demo data separated from production data

If a project has no coordinates, show:

“Location data unavailable.”

Do not place it at a default map coordinate.

==================================================
49. DEMO WORKFLOW
==================================================

Implement and test the following demo:

1. Login as MP
2. Create a recommendation
3. Show generated project code
4. Login as District Authority
5. Review project
6. Sanction project
7. Assign Implementing Agency
8. Login as Implementing Agency
9. Update financial progress to 82%
10. Update physical progress to 38%
11. Upload a progress photograph
12. Upload a sample supporting document
13. Run risk analysis
14. Generate Trust Assessment
15. Generate Anomaly Radar
16. Show Explainable AI factors:
    - Progress mismatch
    - Timeline deviation
    - Evidence gap
17. Login as Monitoring Officer
18. Open Verification Queue
19. Start field inspection
20. Submit inspection with “Requires Further Evidence”
21. Upload inspection evidence
22. Login as District Authority
23. Review inspection and evidence
24. Request clarification or continue review
25. Open Digital Audit Room
26. Show Evidence Passport
27. Show SHA-256 evidence ledger
28. Show immutable project timeline
29. Ask Governance Copilot:
    “Why does this project require verification?”

The demo must communicate:

DETECT
→ VERIFY
→ EXPLAIN
→ PRESERVE
→ ACT

Demo disclosure:

“RAKSHKAVACH does not declare fraud. It identifies projects that deserve closer human review and explains why.”

==================================================
50. DOCUMENTATION REQUIREMENTS
==================================================

Create and maintain:

docs/PRD.md
docs/ARCHITECTURE.md
docs/DESIGN_SYSTEM.md
docs/SECURITY.md
docs/DATA_GOVERNANCE.md
docs/AI_GOVERNANCE.md
docs/API_SPECIFICATION.md
docs/DATABASE_SCHEMA.md
docs/RLS_MODEL.md
docs/STORAGE_MODEL.md
docs/RBAC_MATRIX.md
docs/DATA_IMPORT.md
docs/ML_MODEL_CARD.md
docs/TESTING_STRATEGY.md
docs/DEPLOYMENT.md
docs/DISASTER_RECOVERY.md
docs/INCIDENT_RESPONSE.md
docs/THREAT_MODEL.md
docs/PRIVACY.md
docs/ACCESSIBILITY.md
docs/OPERATIONS_RUNBOOK.md
docs/DEMO_SCRIPT.md
docs/MEMORY.md

The documentation must describe:

- Prototype status
- Security boundaries
- Data flow
- Role permissions
- AI limitations
- Model versions
- Evidence lifecycle
- Audit lifecycle
- Deployment requirements
- Testing strategy
- Incident response
- Disaster recovery
- Privacy and data governance
- Production readiness limitations

==================================================
51. TESTING REQUIREMENTS
==================================================

Backend:

pytest
pytest-asyncio
Ruff
Black
mypy where practical

Frontend:

ESLint
Prettier
TypeScript type checking
Next.js production build
Playwright

Database:

Supabase SQL tests
RLS tests
Permission tests
Cross-scope access tests

Minimum backend tests:

- Health endpoint
- Authentication
- Inactive user denial
- Missing bearer token
- Invalid token
- Project creation
- Invalid project data
- Project scope enforcement
- Status transition validation
- Progress validation
- Evidence authorization
- Signed URL authorization
- Rule engine findings
- Isolation Forest fallback
- Similarity output
- Audit event creation
- Notification creation
- Security headers
- Rate-limit integration point

Minimum RLS tests:

- MP can access own constituency
- MP cannot access another constituency
- District Authority can access own district
- District Authority cannot access another district
- Implementing Agency can access assigned projects
- Implementing Agency cannot access another agency’s project
- Monitoring Officer can access assigned cases
- Unauthorized users cannot download evidence
- Public users cannot access private evidence
- Admin access is explicit
- Delete operations are restricted
- Audit logs are append-only

==================================================
52. SECURITY HARDENING
==================================================

Perform a complete security pass.

Check:

- Authentication bypass
- Broken access control
- Insecure direct object references
- Missing RLS
- Overly broad RLS
- Service-role key exposure
- Unsafe file upload
- Path traversal
- SQL injection
- XSS
- CSRF
- CORS
- Rate limiting
- Missing audit logging
- Cross-district data access
- Cross-agency data access
- Privilege escalation
- Public leakage of private evidence
- Sensitive data in logs
- Missing security headers
- Weak token handling
- Unsafe signed URL generation
- Unauthorized AI query access
- Prompt injection through uploaded documents
- Copilot data leakage
- Unvalidated imported data

Create:

- Security test report
- Threat model
- Remediation notes
- Updated SECURITY.md
- Updated RLS_MODEL.md

==================================================
53. DEVELOPMENT METHOD
==================================================

Do not attempt to build the entire system in one unverified operation.

Work in small phases.

Before modifying existing files:

1. Inspect the repository
2. Identify the existing architecture
3. Produce a gap report
4. Identify conflicting files
5. Identify security risks
6. Propose an implementation order
7. Do not delete existing features without approval

After every phase:

1. Run frontend type checking
2. Run frontend linting
3. Run backend tests
4. Run backend linting
5. Run database tests where relevant
6. Report files changed
7. Report routes created
8. Report database changes
9. Report security implications
10. Report remaining limitations
11. Report manual setup steps
12. Report exact commands executed

Do not claim a command passed unless it was actually run.

==================================================
54. IMPLEMENTATION PHASES
==================================================

Phase 0 — Repository Inspection

Do not modify files.

Produce:

- Repository structure
- Existing frontend architecture
- Existing backend architecture
- Existing database schema
- Existing authentication
- Existing RLS
- Existing storage
- Existing map setup
- Existing project lifecycle
- Missing features
- Security risks
- Recommended implementation order

Phase 1 — Foundation

Implement:

- Monorepo configuration
- Environment files
- Design tokens
- App shell
- Landing page
- Login
- Supabase clients
- Authentication middleware
- Basic profile loading
- Role-aware routing
- Loading, empty and error states

Phase 2 — Database and Authorization

Implement:

- Master data
- Profiles
- Projects
- Project history
- Progress
- Evidence
- Documents
- Alerts
- Inspections
- Notifications
- Audit logs
- RLS
- Storage policies
- SQL tests

Phase 3 — Core Project Lifecycle

Implement:

- MP recommendation
- DA review
- Sanction
- Rejection
- Request information
- Agency assignment
- IA project execution
- Status timeline
- Audit events

Phase 4 — Progress and Evidence

Implement:

- Progress updates
- Progress history
- File upload
- Evidence metadata
- Private storage
- Signed URLs
- Evidence verification
- Evidence Passport
- Evidence ledger

Phase 5 — Intelligence

Implement:

- Rule engine
- Feature engineering
- Isolation Forest
- Similarity detection
- Geospatial analysis
- Trust Assessment
- Anomaly Radar
- Explainable AI
- Risk queue

Phase 6 — Monitoring and Audit

Implement:

- Monitoring dashboard
- Inspection workflow
- Inspection report
- District Authority final review
- Digital Audit Room
- Audit export
- Notifications

Phase 7 — Governance Copilot and Analytics

Implement:

- Authorized Copilot
- Project analytics
- Financial analytics
- Verification analytics
- AI monitoring
- Admin dashboards

Phase 8 — Hardening

Implement:

- Security review
- Accessibility review
- Responsive review
- RLS tests
- Cross-role tests
- Upload security
- Rate limiting
- Security headers
- Production configuration
- Documentation completion

==================================================
55. OUTPUT FORMAT AFTER EACH PHASE
==================================================

After each implementation phase, respond using this structure:

## Phase Completed

Describe what was implemented.

## Files Created

List every new file.

## Files Modified

List every modified file.

## Routes Added

List frontend routes and backend endpoints.

## Database Changes

List migrations, tables, policies, indexes and functions.

## Security Controls

Describe authentication, authorization, RLS, storage and audit controls.

## Tests Executed

List exact commands and actual results.

## Known Limitations

List unfinished or prototype-only functionality.

## Manual Setup

List environment variables, Supabase steps, Mapbox steps and commands.

## Next Recommended Phase

Describe the next implementation step.

==================================================
56. ACCEPTANCE CRITERIA
==================================================

The implementation is acceptable only when:

1. The product is branded RAKSHKAVACH.
2. The UI does not falsely claim official government ownership.
3. Authentication works.
4. Unauthorized users are blocked.
5. Roles are loaded from trusted backend data.
6. Project scope is enforced.
7. RLS is enabled on all exposed tables.
8. Private evidence cannot be accessed publicly.
9. Service-role keys are never exposed to the browser.
10. Project lifecycle transitions are validated.
11. Progress history is append-only.
12. Evidence metadata is preserved.
13. Evidence hashes are generated.
14. Risk signals include explanations.
15. AI does not claim fraud.
16. Missing coordinates are not fabricated.
17. The verification queue is actionable.
18. Monitoring Officers can submit inspections.
19. District Authorities can review evidence.
20. Audit history is visible.
21. Governance Copilot respects authorization.
22. Empty and error states are implemented.
23. Responsive layouts work.
24. Accessibility standards are addressed.
25. Automated tests exist.
26. Documentation exists.
27. Production limitations are clearly documented.

==================================================
57. FINAL PRODUCT MESSAGE
==================================================

The completed product must tell one connected story:

Every project has a digital journey.

Every AI signal has an explanation.

Every decision has evidence.

Every important evidence item has an auditable history.

The final interface must communicate:

RECOMMEND
→ SANCTION
→ EXECUTE
→ DETECT
→ VERIFY
→ EXPLAIN
→ INSPECT
→ DECIDE
→ PRESERVE
→ AUDIT

Do not build a collection of disconnected dashboard screens.

Build one connected governance platform around the MPLADS project lifecycle.

Begin with Phase 0: inspect the repository without modifying files.
```
## Recommended First Follow-Up Prompt
After the coding agent finishes repository inspection, use:

```text
Based on your repository inspection, now produce the gap report.

Do not write implementation code yet.

Include:

1. Existing frontend architecture
2. Existing backend architecture
3. Existing Supabase schema
4. Existing RLS policies
5. Existing authentication flow
6. Existing storage configuration
7. Existing project lifecycle
8. Existing UI components
9. Existing test coverage
10. Security risks
11. Conflicting requirements
12. Missing files
13. Recommended implementation phases
14. Exact first-phase file changes
15. Estimated complexity for each phase

Pay special attention to:

- Service-role key exposure
- RLS coverage
- Cross-district access
- Cross-agency access
- Unauthorized evidence downloads
- Role escalation
- Fabricated map coordinates
- AI language that could imply fraud
- Missing audit events
- Missing historical data preservation

Do not modify files until the gap report is complete.
```
## Recommended First Build Prompt
After approving the gap report, use:

```text
Begin Phase 1 only.

Implement the foundation:

- RAKSHKAVACH branding
- Design tokens
- Application shell
- Responsive sidebar
- Header
- Landing page
- Login page
- Supabase browser client
- Supabase server client
- Authentication middleware
- Protected route structure
- Profile-loading foundation
- Role-aware dashboard redirect
- Loading states
- Empty states
- Error states
- Permission-denied state
- Prototype disclosure

Do not implement the full project lifecycle yet.

Do not create fake government logos.

Do not expose the service-role key.

Do not fabricate project data or locations.

Use clearly marked DEMO DATA only if required for visual testing.

After implementation, run:

- pnpm lint
- pnpm typecheck
- pnpm build
- backend tests if backend files were changed

Report all changed files, routes, security implications and remaining limitations.
```


