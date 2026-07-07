from pydantic import BaseModel
from typing import Optional
from app.enums.target_audience import TargetAudience


class Campaign(BaseModel):
    id: int
    campaign_goal: str
    target_audience: TargetAudience
    industry: str
    budget: float
    brand_id: Optional[int] = None  # Reference to brand profile for consistent voice

