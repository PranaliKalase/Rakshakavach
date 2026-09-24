from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RAKSHKAVACH Backend API",
        "version": "1.0.0",
        "disclaimer": "Prototype decision-support platform. Not an official Government of India application."
    }
