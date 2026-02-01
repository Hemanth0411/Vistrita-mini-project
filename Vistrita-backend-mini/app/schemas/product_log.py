from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ProductLogBase(BaseModel):
    product_name: str
    category: str
    tone: str
    description: str
    titles: Optional[list] = []
    description_short: Optional[str] = ""
    description_long: Optional[str] = ""
    bullets: Optional[list] = []
    warnings: Optional[list] = []
    keywords: Optional[list] = []

class ProductLogCreate(ProductLogBase):
    pass

class ProductLog(ProductLogBase):
    id: int
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True