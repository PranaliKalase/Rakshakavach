# Demo Walkthrough Script — RAKSHKAVACH

Follow this step-by-step walkthrough to demonstrate the full RAKSHKAVACH project lifecycle:

1. **Login as MP**:
   - Access `/login` and select MP Demo.
   - Navigate to `/projects/new` and submit a new recommendation (e.g. "Solar Street Light Installation").
   - System auto-generates project code `MPLADS-2026-DEL01-001`.

2. **Login as District Authority**:
   - Access District Monitoring Dashboard (`/dashboard/district-authority`).
   - Review recommendation, sanction project, and assign to "Public Works Department".

3. **Login as Implementing Agency**:
   - Access `/dashboard/implementing-agency`.
   - Update execution progress: Financial 82%, Physical 38%.
   - Upload site progress photograph.

4. **AI Risk Assessment**:
   - System triggers Anomaly Radar rule `PROGRESS_MISMATCH` (Financial 82% vs Physical 38%).
   - Trust Assessment Score updates to `60 / 100` (*Requires Verification*).
   - Explainable AI panel details key factors.

5. **Login as Monitoring Officer**:
   - Access Field Verification Dashboard (`/dashboard/monitoring-officer`).
   - Conduct inspection and submit report with outcome `Requires Further Evidence`.

6. **Review Digital Audit Room**:
   - Navigate to `/audit-room`.
   - Inspect Evidence Passport, SHA-256 evidence ledger, and immutable project timeline.

7. **Query Governance Copilot**:
   - Access `/copilot` and query: *"Why does project MPLADS-2026-DEL01-001 require verification?"*
   - Copilot returns detailed response with explicit source citations and safety disclaimer.
