from fastapi import APIRouter, HTTPException, status, Request

from app.schemas.product import (
    GenerateRequest, 
    GenerateResponse, 
    GenerateFromImageRequest, 
    GenerateFromImageResponse,
    VisionRequest,
    BulkGenerateRequest,
    BulkGenerateResponse
)
from app.services.generator import generate_product_description
from app.services.vision import extract_attributes_from_image
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.product import ProductDescription
from app.core.auth import get_current_user
from fastapi import Depends

from app.core.limiter import limiter
from app.core.exceptions import ValidationError, AIProviderError


router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
@limiter.limit("10/minute")
async def generate_description(
    request: Request,
    generate_request: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates marketing content (titles, description, bullets) based on product details.
    """
    
    if not generate_request.title or not generate_request.category:
        raise ValidationError("Title and Category are required.")


    try:
        result = generate_product_description(generate_request)

        db_log = ProductDescription(
            product_name=generate_request.title,
            category=generate_request.category,
            tone=generate_request.tone,
            description=result["description_long"], 
            titles=result.get("titles", []),
            description_short=result.get("description_short", ""),
            description_long=result.get("description_long", ""),
            bullets=result.get("bullets", []),
            warnings=result.get("warnings", []),
            keywords=result.get("keywords", []),
            user_id=current_user.id
        )
        db.add(db_log)
        db.commit()
        
        return result
    except Exception as e:
        raise AIProviderError(str(e))


@router.post("/from-vision", response_model=GenerateFromImageResponse)
@limiter.limit("5/minute")
async def generate_from_vision(
    request: Request,
    vision_request: GenerateFromImageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    1. Extracts attributes from image.
    2. Uses those attributes to generate text description automatically.
    """
    try:
        # STEP 1: Extract Attributes (Vision)
        vision_req = VisionRequest(image=vision_request.image)
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

        title = f"{detected_color} {detected_shape}" # e.g. "Red Sneaker"
        category = attrs.get("style", "General")

        # Create a temporary GenerateRequest
        gen_request = GenerateRequest(
            title=title,
            category=category,
            features=[detected_material] + detected_keywords,
            tone=vision_request.tone,
            image=vision_request.image
        )

        # STEP 3: Generate Text (LLM)
        text_result = generate_product_description(gen_request)

        # STEP 4: SAVE TO DB
        db_log = ProductDescription(
            product_name=title,
            category=category,
            tone=vision_request.tone,
            description=text_result["description_long"],
            titles=text_result.get("titles", []),
            description_short=text_result.get("description_short", ""),
            description_long=text_result.get("description_long", ""),
            bullets=text_result.get("bullets", []),
            warnings=text_result.get("warnings", []),
            keywords=text_result.get("keywords", []),
            user_id=current_user.id
        )
        db.add(db_log)
        db.commit()

        return {
            "attributes": attrs,
            "generated": text_result
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Composite generation failed: {str(e)}"
        )

@router.post("/generate/bulk", response_model=BulkGenerateResponse)
@limiter.limit("2/minute")
async def generate_bulk_descriptions(
    request: Request,
    bulk_request: BulkGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts a list of products, generates descriptions for each, and saves them to the DB.
    Returns the list of generated results.
    """
    results = []
    successful_count = 0
    failed_count = 0

    for product_req in bulk_request.products:
        # Generate content (this handles its own exceptions and returns an error dict if needed)
        result = generate_product_description(product_req)
        
        # Check if it was an error response/fallback
        # (The service returns "titles": ["Error..."] on failure)
        is_error = result.get("titles") and result["titles"][0].startswith("Error")
        
        if is_error:
            failed_count += 1
        else:
            successful_count += 1

        # Save to DB (only if we have a valid-ish result, though saving errors can be useful too)
        # We will save everything that has a description_long
        try:
            db_log = ProductDescription(
                product_name=product_req.title,
                category=product_req.category,
                tone=product_req.tone,
                description=result["description_long"],
                titles=result.get("titles", []),
                description_short=result.get("description_short", ""),
                description_long=result.get("description_long", ""),
                bullets=result.get("bullets", []),
                warnings=result.get("warnings", []),
                keywords=result.get("keywords", []),
                user_id=current_user.id
            )
            db.add(db_log)
            db.commit()
            db.refresh(db_log)
        except Exception as e:
            print(f"Failed to save log for {product_req.title}: {e}")
            # we don't fail the request, just log it
        
        results.append(result)

    return {
        "results": results,
        "metrics": {
            "total": len(bulk_request.products),
            "successful": successful_count,
            "failed": failed_count
        }
    }