from fastapi import APIRouter, FastAPI, UploadFile, HTTPException
from fastapi.responses import Response, HTMLResponse
from pathlib import Path
from app.models.product import Product
from app.models.campaign import Campaign
from app.models.brand import BrandProfile, BrandProfileCreate, BrandProfileUpdate
from app.models.image import ImageGenerationRequest, ImageGenerationResponse
from app.models.email import (
    EmailGenerationRequest, 
    EmailGenerationResponse,
    BatchEmailRequest,
    BatchEmailResponse
)
from app.scripts.post_generation import generate_post
from app.scripts.campaign_generation import generate_campaign
from app.services import brand_service
from app.services.image_service import generate_marketing_image, generate_platform_image
from app.services.ad_service import AdService
from app.services.email_service import (
    generate_email,
    generate_batch_emails,
    generate_email_preview
)
import uuid
import time
import os
import asyncio
from fastapi import APIRouter, UploadFile, File, Form, Request, HTTPException
from fastapi.responses import FileResponse
from google import genai
from typing import Optional

import uuid
from fastapi import File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
# Import the helper functions from the script we created
from app.scripts.visual_gen import  _clean_llm_html, _render_with_playwright
generation = APIRouter()



@generation.post("/api/brands", response_model=BrandProfile)
async def create_brand(brand: BrandProfileCreate):
    """Create a new brand profile for consistent content voice."""
    return brand_service.create_brand(brand)


@generation.get("/api/brands", response_model=list[BrandProfile])
async def list_brands():
    """Get all brand profiles."""
    return brand_service.get_all_brands()


@generation.get("/api/brands/{brand_id}", response_model=BrandProfile)
async def get_brand(brand_id: int):
    """Get a specific brand profile by ID."""
    brand = brand_service.get_brand(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@generation.put("/api/brands/{brand_id}", response_model=BrandProfile)
async def update_brand(brand_id: int, brand: BrandProfileUpdate):
    """Update a brand profile."""
    updated = brand_service.update_brand(brand_id, brand)
    if not updated:
        raise HTTPException(status_code=404, detail="Brand not found")
    return updated


@generation.delete("/api/brands/{brand_id}")
async def delete_brand(brand_id: int):
    """Delete a brand profile."""
    deleted = brand_service.delete_brand(brand_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Brand not found")
    return {"message": "Brand deleted successfully"}



@generation.post("/api/generate-post")
async def create_post(product: Product):
    """Generate social media posts for a product.
    
    If brand_id is provided, the generated content will follow 
    the brand's tone, style, and guidelines.
    """
    # Validate brand exists if brand_id provided
    if product.brand_id:
        brand = brand_service.get_brand(product.brand_id)
        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")
    
    result = await generate_post(product)
    return result


@generation.post("/api/create-campaign")
async def create_campaign(campaign: Campaign):
    """Create a marketing campaign plan."""
    # Placeholder for campaign generation logic
    result = await generate_campaign(campaign)
    return result


# ==================== IMAGE GENERATION ENDPOINTS ====================

@generation.post("/api/generate-image", response_model=ImageGenerationResponse)
async def create_marketing_image(request: ImageGenerationRequest):
    """
    Generate a marketing image using AI.
    
    Flow: Product Data + Brand Guidelines → LLM creates image prompt → Diffusion model generates image
    
    If brand_id is provided, the generated image will align with the brand's visual identity.
    Returns the image as base64-encoded PNG.
    """
    # Validate brand exists if brand_id provided
    if request.brand_id:
        brand = brand_service.get_brand(request.brand_id)
        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")
    
    result = await generate_marketing_image(request)
    return result


@generation.post("/api/generate-image/{platform}", response_model=ImageGenerationResponse)
async def create_platform_image(platform: str, request: ImageGenerationRequest):
    """
    Generate a marketing image optimized for a specific social media platform.
    
    Supported platforms: instagram, facebook, twitter, linkedin, pinterest
    
    Each platform has optimized aspect ratios and style presets.
    """
    valid_platforms = ["instagram", "facebook", "twitter", "linkedin", "pinterest"]
    if platform.lower() not in valid_platforms:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid platform. Must be one of: {', '.join(valid_platforms)}"
        )
    
    # Validate brand exists if brand_id provided
    if request.brand_id:
        brand = brand_service.get_brand(request.brand_id)
        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")
    
    result = await generate_platform_image(request, platform)
    return result
#=================== END IMAGE GENERATION ENDPOINTS ====================
#============== Begin Ad Generation Endpoints ==============


# Ensure these directories exist
os.makedirs("static/generated_ads", exist_ok=True)



@generation.post("/api/generate-ad")
async def generate_ad_endpoint(
    request: Request,
    product: str = Form(...),
    style: str = Form("Minimalist Luxury"),
    image_file: UploadFile = File(...), # Receives the manual upload
    brand_id: Optional[int] = Form(None),
    description: str = Form("")
):
    # 1. Read the uploaded file into bytes
    image_bytes = await image_file.read()
    
    # 2. Call your service (AdService)
    # Ensure your service is updated to accept bytes*
    ad_service = AdService(brand_service=brand_service, gemini_client=genai.Client(api_key=os.environ.get("GOOGLE_API_KEY")))
    result_path = await ad_service.create_ad_asset(
        product=product,
        style=style,
        image_bytes=image_bytes, 
        brand_id=brand_id,
        base_url=str(request.base_url).rstrip("/")
    )
    
    return FileResponse(result_path, media_type="image/png")


# ==================== EMAIL GENERATION ENDPOINTS ====================

@generation.post("/api/generate-email", response_model=EmailGenerationResponse)
async def create_personalized_email(request: EmailGenerationRequest):
    """
    Generate personalized marketing email variants using AI.
    
    This endpoint creates highly personalized email content based on:
    - Recipient data (name, interests, purchase history, engagement level)
    - Product/offer information
    - Brand guidelines (if brand_id provided)
    - Email type (promotional, welcome, abandoned_cart, etc.)
    - Desired tone (friendly, professional, urgent, etc.)
    
    Returns multiple email variants for A/B testing with:
    - Subject lines
    - Preview text
    - Personalized greeting
    - Body content
    - Call-to-action text
    - Closing/sign-off
    - Optional P.S. line and social proof
    
    Example use cases:
    - Welcome emails for new subscribers
    - Abandoned cart recovery emails
    - Promotional emails with personalized offers
    - Re-engagement campaigns for inactive customers
    - Product launch announcements
    """
    # Validate brand exists if brand_id provided
    if request.brand_id:
        brand = brand_service.get_brand(request.brand_id)
        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")
    
    result = await generate_email(request)
    return result


@generation.post("/api/generate-email/batch", response_model=BatchEmailResponse)
async def create_batch_emails(batch_request: BatchEmailRequest):
    """
    Generate personalized emails for multiple recipients in a single request.
    
    Uses the same base email configuration but personalizes content 
    for each recipient based on their individual data.
    
    Ideal for:
    - Email marketing campaigns to segmented lists
    - Personalized promotional blasts
    - Customer retention campaigns
    - Newsletter personalization
    
    Note: Each recipient gets 1 personalized variant (not multiple like single generation).
    """
    # Validate brand exists if brand_id provided
    if batch_request.base_request.brand_id:
        brand = brand_service.get_brand(batch_request.base_request.brand_id)
        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")
    
    result = await generate_batch_emails(batch_request)
    return result


@generation.post("/api/generate-email/preview", response_class=HTMLResponse)
async def preview_email(request: EmailGenerationRequest):
    """
    Generate and return an HTML preview of the personalized email.
    
    Useful for:
    - Quickly visualizing email appearance
    - Testing email rendering
    - Sharing email previews with stakeholders
    
    Returns a styled HTML page showing the first email variant.
    """
    # Validate brand exists if brand_id provided
    if request.brand_id:
        brand = brand_service.get_brand(request.brand_id)
        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")
    
    html_preview = await generate_email_preview(request)
    return HTMLResponse(content=html_preview)


# ==================== END EMAIL GENERATION ENDPOINTS ====================