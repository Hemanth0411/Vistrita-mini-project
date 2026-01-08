from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

# Simple start time tracking (in-memory for mini-project)
start_time = datetime.now()

@router.get("/health")
def health_check():
    """
    Simple liveness check.
    """
    uptime_seconds = (datetime.now() - start_time).total_seconds()
    
    return {
        "status": "ok",
        "service": "vistrita-api",
        "version": "1.0-mini",
        "uptime": f"{uptime_seconds:.2f}s"
    }