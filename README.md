# RAKSHKAVACH — AI-Powered MPLADS Verification & Trust Platform

> **Disclaimer**: Prototype decision-support platform. Not an official Government of India application.

**RAKSHKAVACH** is a prototype decision-support, verification, monitoring, and audit platform built around the MPLADS (Members of Parliament Local Area Development Scheme) project lifecycle.

## Core Philosophy
- **AI ASSISTS.**
- **HUMANS VERIFY.**
- **AUTHORIZED OFFICERS DECIDE.**

AI detects signals, explains signals, and prioritizes attention. Authorized humans conduct field verifications and official authorities make decisions, with full immutable provenance stored in the tamper-evident ledger.

---

## Core Product Journey
```
RECOMMEND ➔ SANCTION ➔ ASSIGN ➔ EXECUTE ➔ DETECT ➔ VERIFY ➔ EXPLAIN ➔ INSPECT ➔ DECIDE ➔ PRESERVE ➔ AUDIT
```

---

## Technical Architecture

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, Recharts, Mapbox GL JS UI.
- **Backend**: Python 3.11+, FastAPI, Pydantic, Scikit-Learn (Isolation Forest), Cosine Similarity (TF-IDF), GeoPandas/Shapely logic.
- **Database & Storage**: Supabase PostgreSQL with Row Level Security (RLS), cryptographic SHA-256 evidence ledger.
- **Documentation**: 24 specification documents in `docs/`.

---

## Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Unix:
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application shell and interactive role-based dashboards.
live prototype link:
https://rakshakavach-frontend.onrender.com/

---

## Testing & Quality Assurance
```bash
# Backend pytest suite
cd backend && pytest

# Frontend type check
cd frontend && npm run build
```

---

## Governance & Safety Rules
- **No False Accusations**: Terminology is strictly restricted to review signals (*"Requires Verification"*, *"Attention Required"*, *"Anomaly Detected"*, *"Verification Priority"*).
- **Explainability**: Every AI assessment provides model details, versioning, timestamps, reason codes, and affected fields.
- **Human Authority**: AI cannot automatically sanction, reject, or modify official records.

---

## License
MIT License - see [LICENSE](file:///f:/Git%20Push%20Extract/rakshakavach/LICENSE) for details.
