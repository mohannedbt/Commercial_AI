"""
Image Generation Service
Implements the flow: Product Data + Brand Guidelines → LLM creates image prompt → Diffusion model generates image
"""

from google import genai
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import os
import json
import base64
from typing import Optional

from app.models.image import (
    ImageGenerationRequest,
    ImagePromptResponse,
    ImageGenerationResponse
)
from app.prompts.image_generation import (
    IMAGE_PROMPT_SYSTEM,
    IMAGE_PROMPT_TEMPLATE,
    BRAND_IMAGE_GUIDELINES,
    PLATFORM_STYLES
)
from app.services.brand_service import get_brand

load_dotenv()

# Initialize clients
gemini_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
hf_client = InferenceClient(token=os.getenv("HF_API_TOKEN"))

# Default model for image generation (Stable Diffusion XL)
DEFAULT_IMAGE_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"


async def generate_image_prompt(request: ImageGenerationRequest) -> ImagePromptResponse:
    """
    Step 1: Use LLM to create an optimized image generation prompt
    based on product data and brand guidelines.
    """
    # Build brand guidelines section if brand_id provided
    brand_guidelines = ""
    if request.brand_id:
        brand = get_brand(request.brand_id)
        if brand:
            brand_guidelines = BRAND_IMAGE_GUIDELINES.format(
                brand_name=brand.name,
                tone=brand.tone.value,
                style_notes=brand.style_guidelines or "Not specified",
                colors="Based on brand tone and values",
                keywords=", ".join(brand.keywords_include) if brand.keywords_include else "None specified",
                avoid=", ".join(brand.keywords_avoid) if brand.keywords_avoid else "None specified"
            )
    
    # Format the prompt template
    formatted_prompt = IMAGE_PROMPT_TEMPLATE.format(
        product_name=request.product_name,
        product_description=request.product_description,
        target_audience=request.target_audience.value,
        style=request.style,
        aspect_ratio=request.aspect_ratio,
        brand_guidelines=brand_guidelines
    )
    
    # Call Gemini to generate the image prompt
    full_prompt = f"{IMAGE_PROMPT_SYSTEM}\n\n{formatted_prompt}"
    
    response = gemini_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=full_prompt
    )
    
    response_text = response.text
    
    # Parse JSON response
    try:
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        prompt_data = json.loads(response_text)
        
        return ImagePromptResponse(
            prompt=prompt_data.get("prompt", ""),
            negative_prompt=prompt_data.get("negative_prompt", "blurry, low quality, text, watermark"),
            style_keywords=prompt_data.get("style_keywords", [])
        )
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        return ImagePromptResponse(
            prompt=response_text,
            negative_prompt="blurry, low quality, text, watermark, distorted",
            style_keywords=["professional", "marketing", "product"]
        )


async def generate_image_from_prompt(
    prompt: str,
    negative_prompt: str = "blurry, low quality, text, watermark",
    model: str = DEFAULT_IMAGE_MODEL
) -> Optional[bytes]:
    """
    Step 2: Use diffusion model to generate image from prompt.
    Returns image bytes or None if generation fails.
    """
    try:
        # Use Hugging Face Inference API for image generation
        image_bytes = hf_client.text_to_image(
            prompt=prompt,
            negative_prompt=negative_prompt,
            model=model,
            guidance_scale=7.5,
            num_inference_steps=50
        )
        
        # Convert PIL Image to bytes
        import io
        img_byte_arr = io.BytesIO()
        image_bytes.save(img_byte_arr, format='PNG')
        return img_byte_arr.getvalue()
        
    except Exception as e:
        print(f"Image generation error: {e}")
        return None


async def generate_marketing_image(request: ImageGenerationRequest) -> ImageGenerationResponse:
    """
    Main function: Complete flow from product data to generated image.
    
    Flow:
    1. Product Data + Brand Guidelines → 
    2. LLM creates optimized image prompt → 
    3. Diffusion model generates image
    """
    try:
        # Step 1: Generate image prompt using LLM
        prompt_response = await generate_image_prompt(request)
        
        # Step 2: Generate image using diffusion model
        image_bytes = await generate_image_from_prompt(
            prompt=prompt_response.prompt,
            negative_prompt=prompt_response.negative_prompt
        )
        
        if image_bytes:
            # Encode image as base64 for API response
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            
            # Save image to data directory
            data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data")
            os.makedirs(data_dir, exist_ok=True)
            
            # Generate filename from product name
            safe_filename = "".join(c if c.isalnum() or c in "-_" else "_" for c in request.product_name)
            image_path = os.path.join(data_dir, f"{safe_filename}.png")
            
            with open(image_path, "wb") as f:
                f.write(image_bytes)
            
            return ImageGenerationResponse(
                success=True,
                product_name=request.product_name,
                image_prompt=prompt_response.prompt,
                image_base64=image_base64
            )
        else:
            return ImageGenerationResponse(
                success=False,
                product_name=request.product_name,
                image_prompt=prompt_response.prompt,
                error="Failed to generate image from diffusion model"
            )
            
    except Exception as e:
        return ImageGenerationResponse(
            success=False,
            product_name=request.product_name,
            image_prompt="",
            error=str(e)
        )


async def generate_platform_image(
    request: ImageGenerationRequest,
    platform: str
) -> ImageGenerationResponse:
    """
    Generate an image optimized for a specific social media platform.
    """
    if platform.lower() in PLATFORM_STYLES:
        platform_config = PLATFORM_STYLES[platform.lower()]
        request.aspect_ratio = platform_config["aspect_ratio"]
        request.style = f"{request.style}, {platform_config['style']}"
    
    return await generate_marketing_image(request)
