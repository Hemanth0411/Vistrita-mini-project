from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ProductLogBase(BaseModel):
    product_name: str
    description: str

class ProductLogCreate(ProductLogBase):
    pass

class ProductLog(ProductLogBase):
    id: int
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True