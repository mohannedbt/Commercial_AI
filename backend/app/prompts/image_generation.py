"""Prompts for generating brand-consistent image descriptions."""

IMAGE_PROMPT_SYSTEM = """You are an expert visual marketing strategist and prompt engineer for AI image generation.
Your task is to create detailed, effective prompts for generating marketing images using text-to-image AI models.

The prompts you create should:
1. Be highly descriptive and specific about visual elements
2. Include style, lighting, composition, and mood details
3. Be optimized for commercial/marketing use
4. Avoid any text or words in the image (AI struggles with text)
5. Focus on product presentation and brand aesthetics
"""

IMAGE_PROMPT_TEMPLATE = """Based on the following product and brand information, create a detailed image generation prompt.

=== PRODUCT INFORMATION ===
Product Name: {product_name}
Description: {product_description}
Target Audience: {target_audience}
Desired Style: {style}
Aspect Ratio: {aspect_ratio}

{brand_guidelines}

=== INSTRUCTIONS ===
Generate a JSON response with:
1. "prompt": A detailed, vivid description for the image (150-200 words). Include:
   - Subject/product placement and presentation
   - Background and environment
   - Lighting style (soft, dramatic, natural, studio, etc.)
   - Color palette and mood
   - Camera angle and composition
   - Style keywords (photorealistic, minimalist, vibrant, etc.)

2. "negative_prompt": Things to avoid in the image (text, blurry, low quality, etc.)

3. "style_keywords": Array of 5-7 style keywords for the image

Format your response as valid JSON:
{{
    "prompt": "detailed prompt here...",
    "negative_prompt": "things to avoid...",
    "style_keywords": ["keyword1", "keyword2", ...]
}}
"""

BRAND_IMAGE_GUIDELINES = """
=== BRAND VISUAL GUIDELINES ===
Brand Name: {brand_name}
Brand Tone: {tone}
Visual Style Notes: {style_notes}
Color Preferences: {colors}
Keywords to Emphasize: {keywords}
Elements to Avoid: {avoid}

IMPORTANT: The generated image must align with this brand's visual identity.
"""

# Style presets for different platforms
PLATFORM_STYLES = {
    "instagram": {
        "aspect_ratio": "1:1",
        "style": "vibrant, eye-catching, lifestyle-focused, Instagram-worthy aesthetic"
    },
    "facebook": {
        "aspect_ratio": "16:9",
        "style": "professional, community-focused, warm and inviting"
    },
    "twitter": {
        "aspect_ratio": "16:9",
        "style": "bold, attention-grabbing, clean and modern"
    },
    "linkedin": {
        "aspect_ratio": "1.91:1",
        "style": "professional, corporate, polished and sophisticated"
    },
    "pinterest": {
        "aspect_ratio": "2:3",
        "style": "aspirational, beautiful, highly visual, pin-worthy"
    }
}
