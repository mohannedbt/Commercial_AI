from pydantic import BaseModel
from typing import Optional
from app.enums.target_audience import TargetAudience


class ImageGenerationRequest(BaseModel):
    """Request model for generating marketing images."""
    product_name: str
    product_description: str
    target_audience: TargetAudience
    brand_id: Optional[int] = None
    style: Optional[str] = "professional product photography"
    aspect_ratio: Optional[str] = "1:1"  # 1:1 for Instagram, 16:9 for Facebook/Twitter
    include_text: Optional[bool] = False  # Whether to include text overlay in image


class ImagePromptResponse(BaseModel):
    """Response from LLM containing the image generation prompt."""
    prompt: str
    negative_prompt: str
    style_keywords: list[str]


class ImageGenerationResponse(BaseModel):
    """Final response with generated image."""
    success: bool
    product_name: str
    image_prompt: str
    image_url: Optional[str] = None  # URL or base64 encoded image
    image_base64: Optional[str] = None
    error: Optional[str] = None
