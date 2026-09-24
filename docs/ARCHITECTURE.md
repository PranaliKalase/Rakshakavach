# System Architecture — RAKSHKAVACH

## 1. Overview
RAKSHKAVACH utilizes a modern monorepo architecture separating the Next.js frontend, Python FastAPI backend, and Supabase PostgreSQL data layer.

```
+-------------------------------------------------------------+
|                     Next.js 14+ Frontend                    |
| App Router | TypeScript | Tailwind CSS | Recharts | Mapbox GL |
+------------------------------+------------------------------+
                               | REST API / Auth JWT
+------------------------------v------------------------------+
|                     Python FastAPI Backend                   |
|  Rule Engine | Isolation Forest | TF-IDF Cosine | GIS Logic |
+------------------------------+------------------------------+
                               | PostgreSQL connection / RLS
+------------------------------v------------------------------+
|                    Supabase PostgreSQL                       |
|   Master Data | Projects | Risk | Inspections | SHA-256 Ledger|
+-------------------------------------------------------------+
```

## 2. Component Scoping
- **Frontend App Shell**: Handles role routing, layout wrapping, notifications, and client state.
- **Backend ML Services**: Executes deterministic anomaly rules, scikit-learn Isolation Forest, document field comparison, and TF-IDF similarity calculation.
- **Database Engine**: Stores relational records, enforces Row Level Security (RLS) policies, and maintains append-only audit histories.
