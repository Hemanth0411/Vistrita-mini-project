from fastapi import APIRouter
from app.schemas.product import GenerateRequest, GenerateResponse

router = APIRouter()

@router.get("/sample-schema")
def get_sample_schema():
    """
    Returns the expected input/output format for the frontend.
    """
    return {
        "input_schema": {
            "title": "string",
            "category": "string",
            "features": ["string"],
            "tone": ["neutral", "formal", "playful", "luxury", "minimalist"],
            "image": "base64 string or null"
        },
        "output_schema": {
            "titles": ["string"],
            "description_short": "string",
            "description_long": "string",
            "bullets": ["string"],
            "warnings": ["string"]
        }
    }