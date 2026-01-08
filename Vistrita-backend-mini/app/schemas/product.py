from pydantic import BaseModel, Field
from typing import List, Optional

class GenerateRequest(BaseModel):
    title: str = Field(..., example="Wireless Noise Cancelling Headphones")
    category: str = Field(..., example="Electronics")
    features: List[str] = Field(..., example=["Active Noise Cancellation", "20h Battery", "Bluetooth 5.0"], min_items=1)
    tone: str = Field("neutral", pattern="^(neutral|formal|playful|luxury|minimalist|Professional|Casual|Technical|Luxury|Playful|Minimalist)$", example="luxury")
    image: Optional[str] = Field(None, description="Base64 encoded image string")

class VisionRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded image string")

class GenerateResponse(BaseModel):
    titles: List[str]
    description_short: str
    description_long: str
    bullets: List[str]
    warnings: List[str]

class VisionResponse(BaseModel):
    attributes: dict

class GenerateFromImageRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded image string")
    tone: str = Field("neutral", pattern="^(neutral|formal|playful|luxury|minimalist)$")

class GenerateFromImageResponse(BaseModel):
    attributes: dict
    generated: GenerateResponse