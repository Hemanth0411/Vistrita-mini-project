from fastapi import APIRouter, Depends
from app.api.v1.endpoints import health, misc, generator, vision, auth, history
from app.core.auth import get_current_user

api_router = APIRouter()

# Public routes (no auth needed)
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(misc.router, tags=["Documentation"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Protected routes (require Login)
api_router.include_router(generator.router, prefix="/generator", tags=["Generator"], dependencies=[Depends(get_current_user)])
api_router.include_router(vision.router, prefix="/vision", tags=["Vision"], dependencies=[Depends(get_current_user)])
api_router.include_router(history.router, prefix="/history", tags=["History"], dependencies=[Depends(get_current_user)])