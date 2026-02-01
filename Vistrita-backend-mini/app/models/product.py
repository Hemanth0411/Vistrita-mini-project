from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class ProductDescription(Base):
    __tablename__ = "product_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, index=True)
    category = Column(String, index=True)
    tone = Column(String)
    description = Column(Text) # Keeping for backward compat or just as general desc
    
    # New Fields
    titles = Column(JSON, default=[]) 
    description_short = Column(Text, default="")
    description_long = Column(Text, default="")
    bullets = Column(JSON, default=[])
    warnings = Column(JSON, default=[])
    keywords = Column(JSON, default=[])
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))