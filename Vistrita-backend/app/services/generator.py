from google import genai
from google.genai import types
import json
from app.core.config import settings
from app.schemas.product import GenerateRequest

client = genai.Client(api_key=settings.GOOGLE_API_KEY)

def generate_product_description(data: GenerateRequest) -> dict:
    """
    Generate product description content using Gemini (Gen AI) SDK with JSON structured output.
    Returns a dict matching the expected schema (titles, description_short, etc.)
    """
    schema = {
        "type": "object",
        "properties": {
            "titles": { "type": "array", "items": { "type": "string" } },
            "description_short": { "type": "string" },
            "description_long": { "type": "string" },
            "bullets": { "type": "array", "items": { "type": "string" } },
            "warnings": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["titles", "description_short", "description_long", "bullets", "warnings"]
    }

    prompt = f"""
You are an expert e-commerce copywriter.

Generate product description content using:

- Title: {data.title}
- Category: {data.category}
- Key Features: {", ".join(data.features) if data.features else "None"}
- Tone: {data.tone}

Return ONLY valid JSON following the following schema:

{json.dumps(schema, indent=2)}

Output JSON ONLY.
"""

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,   # or latest valid model, e.g. gemini-2.5-flash
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema,
                temperature=0.2,          # you can tune these as needed
                max_output_tokens=512
            )
        )
        json_str = response.text
        result = json.loads(json_str)

        # Optional: validate that required keys are present
        for key in ["titles", "description_short", "description_long", "bullets", "warnings"]:
            if key not in result:
                raise ValueError(f"Missing key in generated JSON: {key}")

        return result

    except Exception as e:
        print("Gemini Error:", e)
        return {
            "titles": ["Error generating titles"],
            "description_short": "Could not generate content.",
            "description_long": f"System Error: {str(e)}",
            "bullets": [],
            "warnings": ["Please check API Key, model name, schema validity, or Internet Connection"]
        }
