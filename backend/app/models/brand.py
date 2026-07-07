from pydantic import BaseModel, Field
from typing import Optional
from app.enums.tone import BrandTone


class BrandProfile(BaseModel):
    """Brand profile for maintaining consistent voice across generated content."""
    
    id: Optional[int] = None
    name: str = Field(..., description="Brand name")
    tone: BrandTone = Field(..., description="Primary brand tone/voice")
    tagline: Optional[str] = Field(None, description="Brand tagline or slogan")
    values: list[str] = Field(default_factory=list, description="Core brand values")
    keywords_include: list[str] = Field(default_factory=list, description="Keywords to include in content")
    keywords_avoid: list[str] = Field(default_factory=list, description="Words/phrases to avoid")
    target_emotion: Optional[str] = Field(None, description="Emotion to evoke (e.g., trust, excitement)")
    example_posts: list[str] = Field(default_factory=list, description="Example posts for few-shot learning")
    style_guidelines: Optional[str] = Field(None, description="Additional style notes")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "TechFlow",
                "tone": "professional",
                "tagline": "Innovation at your fingertips",
                "values": ["innovation", "reliability", "simplicity"],
                "keywords_include": ["cutting-edge", "seamless", "empower"],
                "keywords_avoid": ["cheap", "basic", "old"],
                "target_emotion": "confidence",
                "example_posts": [
                    "Discover the future of productivity. TechFlow transforms how you work. 🚀",
                    "Simple. Powerful. Yours. Experience the TechFlow difference today."
                ],
                "style_guidelines": "Use short, punchy sentences. Avoid jargon. Always end with a clear CTA."
            }
        }


class BrandProfileCreate(BaseModel):
    """Schema for creating a new brand profile."""
    
    name: str
    tone: BrandTone
    tagline: Optional[str] = None
    values: list[str] = []
    keywords_include: list[str] = []
    keywords_avoid: list[str] = []
    target_emotion: Optional[str] = None
    example_posts: list[str] = []
    style_guidelines: Optional[str] = None


class BrandProfileUpdate(BaseModel):
    """Schema for updating a brand profile."""
    
    name: Optional[str] = None
    tone: Optional[BrandTone] = None
    tagline: Optional[str] = None
    values: Optional[list[str]] = None
    keywords_include: Optional[list[str]] = None
    keywords_avoid: Optional[list[str]] = None
    target_emotion: Optional[str] = None
    example_posts: Optional[list[str]] = None
    style_guidelines: Optional[str] = None
