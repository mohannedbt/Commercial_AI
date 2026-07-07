from google import genai
from dotenv import load_dotenv
import os
import json
from app.models.product import Product
from app.prompts.post_generation import SYSTEM_PROMPT, BRAND_CONTEXT_PROMPT
from app.services.brand_service import get_brand_context

load_dotenv()
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


async def generate_post(product: Product) -> dict:
    """
    Generate social media post content using Google Gemini.
    
    Args:
        product: Product object containing all product details
        
    Returns:
        dict: Generated post content with platform-specific variations
    """
    try:
        formatted_prompt = SYSTEM_PROMPT.format(
            name=product.name,
            price=f"${product.price}" if product.price else "Contact for pricing",
            offer=product.offer or "No special offer",
            target_audience=product.target_audience.value,
            description=product.description
        )
        
        # Add brand context if brand_id is provided
        brand_context_str = ""
        if product.brand_id:
            brand_context = get_brand_context(product.brand_id)
            if brand_context:
                brand_context_str = BRAND_CONTEXT_PROMPT.format(brand_context=brand_context)
        
        user_prompt = """Generate 3 different social media posts optimized for:
        1. Instagram (engaging, visual-focused, with emojis and hashtags)
        2. Twitter/X (concise, punchy, within 280 characters)
        3. Facebook (informative, community-oriented)

        Format your response as JSON with the following structure:
        {
            "instagram": {
                "post": "post content here",
                "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
            },
            "twitter": {
                "post": "post content here",
                "hashtags": ["hashtag1", "hashtag2"]
            },
            "facebook": {
                "post": "post content here",
                "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
            }
        }"""

        full_prompt = f"{formatted_prompt}{brand_context_str}\n\n{user_prompt}"

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt
        )
        
        response_content = response.text
        
        try:
            if "```json" in response_content:
                response_content = response_content.split("```json")[1].split("```")[0].strip()
            elif "```" in response_content:
                response_content = response_content.split("```")[1].split("```")[0].strip()
            
            posts = json.loads(response_content)
        except json.JSONDecodeError:
            posts = {
                "instagram": {
                    "post": response_content,
                    "hashtags": ["#marketing", "#product", "#shopping"]
                },
                "twitter": {
                    "post": response_content[:280],
                    "hashtags": ["#marketing", "#product"]
                },
                "facebook": {
                    "post": response_content,
                    "hashtags": ["#marketing", "#product", "#shopping"]
                }
            }
        
        return {
            "success": True,
            "product_name": product.name,
            "posts": posts
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to generate post content"
        }