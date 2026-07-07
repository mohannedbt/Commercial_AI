from google import genai
from dotenv import load_dotenv
import os
import json
from typing import Optional
from app.models.campaign import Campaign
from app.models.brand import BrandProfile
from app.prompts.campaign_generation import SYSTEM_PROMPT, BRAND_SECTION_TEMPLATE
from app.services.brand_service import get_brand

load_dotenv()
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


def _build_brand_section(brand: Optional[BrandProfile]) -> str:
    """Build the brand section for the prompt if brand info is available."""
    if not brand:
        return ""
    
    return BRAND_SECTION_TEMPLATE.format(
        brand_name=brand.name,
        brand_tone=brand.tone.value,
        brand_tagline=brand.tagline or "Not specified",
        brand_values=", ".join(brand.values) if brand.values else "Not specified",
        keywords_include=", ".join(brand.keywords_include) if brand.keywords_include else "None",
        keywords_avoid=", ".join(brand.keywords_avoid) if brand.keywords_avoid else "None",
        target_emotion=brand.target_emotion or "Not specified",
        style_guidelines=brand.style_guidelines or "None"
    )


async def generate_campaign(campaign: Campaign) :
    """
       Generate Marketing campaign advice using Google Gemini.

       Args:
           campaign: Campaign object containing all campaign details

       Returns:
           string: Generated Campaign plan advice
       """
    try:
        # Fetch brand info if brand_id is provided
        brand = None
        if campaign.brand_id:
            brand = get_brand(campaign.brand_id)
        
        # Build brand section for prompt
        brand_section = _build_brand_section(brand)
        
        formatted_prompt = SYSTEM_PROMPT.format(
            campaign_goal=campaign.campaign_goal,
            target_audience=campaign.target_audience.value,
            industry=campaign.industry,
            budget=f"${campaign.budget}" if campaign.budget else "Not specified",
            brand_section=brand_section,
        )

        user_prompt = """Provide a detailed marketing campaign plan that includes:
        1. Recommended marketing channels (e.g., social media, email, SEO)
        2. Content strategy ideas
        3. Budget allocation suggestions
        4. Key performance indicators (KPIs) to track success

        Format your response as plain text with clear sections for each part of the plan."""

        full_prompt = f"{formatted_prompt}\n\n{user_prompt}"

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt
        )

        response_content = response.text

        try:
            return {
                "success": True,
                "content": response_content
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate post content"
            }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to generate post content"
        }