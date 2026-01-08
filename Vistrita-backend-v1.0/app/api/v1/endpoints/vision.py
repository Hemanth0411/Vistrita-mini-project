from fastapi import APIRouter, HTTPException, status
from app.schemas.product import VisionRequest, VisionResponse
from app.services.vision import extract_attributes_from_image

router = APIRouter()

@router.post("/extract", response_model=VisionResponse)
async def extract_image_attributes(request: VisionRequest):
    """
    Upload an image (Base64) -> Get JSON attributes (Color, Material, etc.)
    """
    if not request.image:
        raise HTTPException(status_code=400, detail="Image data required")

    try:
        result = extract_attributes_from_image(request)
        return result
    except ValueError as ve:
         raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision extraction failed: {str(e)}")