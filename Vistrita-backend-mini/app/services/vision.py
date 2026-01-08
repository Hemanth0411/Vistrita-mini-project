import base64
import json
from google import genai
from google.genai import types
from app.core.config import settings
from app.schemas.product import VisionRequest

client = genai.Client(api_key=settings.GOOGLE_API_KEY)

def extract_attributes_from_image(data: VisionRequest) -> dict:
    """
    Decodes Base64 image, sends to Gemini Vision, and extracts attributes.
    """
    
    # 1. Decode Base64 to Bytes
    try:
        # resilient decoding (handles data:image/jpeg;base64, prefix if present)
        image_str = data.image
        if "," in image_str:
            image_str = image_str.split(",")[1]
        
        image_bytes = base64.b64decode(image_str)
    except Exception as e:
        raise ValueError("Invalid Base64 image data")

    # 2. Define Schema
    schema = {
        "type": "object",
        "properties": {
            "attributes": {
                "type": "object",
                "properties": {
                    "color": {"type": "string"},
                    "material": {"type": "string"},
                    "shape": {"type": "string"},
                    "style": {"type": "string"},
                    "keywords": {"type": "array", "items": {"type": "string"}}
                },
                "required": ["color", "material", "style", "keywords"]
            }
        },
        "required": ["attributes"]
    }

    prompt = """
    Analyze this product image.
    Extract visual attributes like color, material, shape, and style.
    Generate 5 relevant keywords for search optimization.
    Return strictly valid JSON.
    """

    # 3. Call Gemini (Multimodal)
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=[
                types.Content(
                    parts=[
                        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                        types.Part.from_text(text=prompt)
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema,
                temperature=0.1
            )
        )
        
        result = json.loads(response.text)
        return result

    except Exception as e:
        print(f"Vision Error: {e}")
        return {
            "attributes": {
                "color": "Unknown",
                "material": "Unknown",
                "shape": "Unknown",
                "style": "Error processing image",
                "keywords": []
            }
        }