from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import health, projects, risk, assistant, inspections, recommendations

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered MPLADS Verification & Trust Platform Backend API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(projects.router, prefix=settings.API_V1_STR, tags=["Projects"])
app.include_router(recommendations.router, prefix=settings.API_V1_STR, tags=["MP Work Recommendations"])
app.include_router(risk.router, prefix=settings.API_V1_STR, tags=["Risk & Intelligence"])
app.include_router(inspections.router, prefix=settings.API_V1_STR, tags=["Field Inspections & Governance Workflow"])
app.include_router(assistant.router, prefix=settings.API_V1_STR, tags=["Governance Copilot"])

@app.on_event("startup")
def startup_event():
    from app.services.data_loader import DataLoaderService
    from app.services.workflow_service import GovernanceWorkflowService
    try:
        DataLoaderService.load_dataset()
        GovernanceWorkflowService.get_verification_queue()
        print("RAKSHKAVACH Dataset & Verification Queue pre-warmed successfully.", flush=True)
    except Exception as e:
        print(f"Startup pre-warming warning: {e}", flush=True)

@app.get("/")
def root():
    return {
        "title": "RAKSHKAVACH API Server",
        "subtitle": "AI-Powered MPLADS Verification & Trust Platform",
        "disclaimer": "Prototype decision-support platform. Not an official Government of India application."
    }
