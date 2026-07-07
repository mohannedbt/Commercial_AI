# app/templates/visual_prompts.py

VISUAL_AD_PROMPT = """Act as a senior graphic designer. Create a high-end promotional visual.

{brand_section}

PRODUCT: {product}
THE VIBE: {style} aesthetic
THE OFFER: "{discount}"
DETAILS: {features}
IMAGE URL: {product_img_url}
DESCRIPTION: {description}

BACKGROUND INSTRUCTION:
{bg_instruction}

COMPOSITION REQUIREMENTS:
- Create a div with class "ad-card" sized 800x800px.
- Use <img class="product-img" src="{product_img_url}">
- If using original background (Keep Background), ensure the .ad-card background matches {detected_color}.
- Use Tailwind-like inline CSS. Output ONLY raw HTML.
- Use the product image as the main hero: <img class="product-img" src="{product_img_url}">
-Use the image as the background 
- make the product prominent and centered.
- Don't zoom only if necessary to fit the product well.
- Include the product name, discount, and features in elegant fonts.
- Ensure the HTML is valid and well-formed.
- Don't put buttons or links.
- DO NOT wrap the output in markdown code blocks (like ```html), just return the raw string.
"""

BRAND_CONTEXT_SECTION = """BRAND DNA:
- Name: {brand_name}
- Tone: {brand_tone}
- Tagline: {brand_tagline}
- Style Guidelines: {style_guidelines}
"""