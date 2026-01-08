from fastapi import APIRouter, HTTPException, status
from app.schemas.product import (
    GenerateRequest, 
    GenerateResponse, 
    GenerateFromImageRequest, 
    GenerateFromImageResponse,
    VisionRequest 
)
from app.services.generator import generate_product_description
from app.services.vision import extract_attributes_from_image

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
async def generate_description(request: GenerateRequest):
    """
    Generates marketing content (titles, description, bullets) based on product details.
    """
    
    if not request.title or not request.category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Title and Category are required."
        )

    try:
        result = generate_product_description(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {str(e)}"
        )

@router.post("/from-vision", response_model=GenerateFromImageResponse)
async def generate_from_vision(request: GenerateFromImageRequest):
    """
    1. Extracts attributes from image.
    2. Uses those attributes to generate text description automatically.
    """
    try:
        # STEP 1: Extract Attributes (Vision)
        vision_req = VisionRequest(image=request.image)
        vision_result = extract_attributes_from_image(vision_req)
        attrs = vision_result.get("attributes", {})
        
        if not attrs:
             raise ValueError("Could not extract attributes from image.")

        # STEP 2: Map Attributes to Generator Input
        # We construct a synthetic title and features list from the visual data
        detected_color = attrs.get("color", "Generic")
        detected_shape = attrs.get("shape", "Product")
        detected_material = attrs.get("material", "")
        detected_keywords = attrs.get("keywords", [])

        # Create a temporary GenerateRequest
        gen_request = GenerateRequest(
            title=f"{detected_color} {detected_shape}", # e.g. "Red Sneaker"
            category=attrs.get("style", "General"),
            features=[detected_material] + detected_keywords,
            tone=request.tone,
            image=request.image
        )

        # STEP 3: Generate Text (LLM)
        text_result = generate_product_description(gen_request)

        return {
            "attributes": attrs,
            "generated": text_result
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Composite generation failed: {str(e)}"
        )