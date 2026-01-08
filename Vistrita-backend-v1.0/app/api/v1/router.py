from fastapi import APIRouter, Depends
from app.api.v1.endpoints import health, misc, generator, vision
from app.core.auth import verify_api_key

api_router = APIRouter()

# Register the health router (no auth needed)
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(misc.router, tags=["Documentation"])

# Protected routes (require API key)
api_router.include_router(generator.router, tags=["Generator"], dependencies=[Depends(verify_api_key)])
api_router.include_router(vision.router, tags=["Vision"], dependencies=[Depends(verify_api_key)])