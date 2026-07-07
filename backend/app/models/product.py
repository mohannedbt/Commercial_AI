from pydantic import BaseModel
from typing import Optional
from app.enums.target_audience import TargetAudience


class Product(BaseModel):
    id: int  
    name: str  
    price: float
    offer: str
    target_audience: TargetAudience 
    description: str
    image_url: str = None
    brand_id: Optional[int] = None  # Link to brand profile for consistent voice
