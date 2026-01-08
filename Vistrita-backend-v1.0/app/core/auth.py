from fastapi import Header, HTTPException
from app.core.config import settings

def verify_api_key(x_api_key: str = Header(None)):
    """Dependency to verify API key from X-API-Key header."""
    if not x_api_key or x_api_key != settings.VISTRITA_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")