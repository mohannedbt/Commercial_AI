import os
import re
import asyncio
import tempfile
from typing import Optional
from app.prompts.ad_generation import VISUAL_AD_PROMPT, BRAND_CONTEXT_SECTION
from app.scripts.visual_gen import _clean_llm_html, _render_with_playwright

class AdService:
    def __init__(self, brand_service, gemini_client):
        self.brand_service = brand_service
        self.client = gemini_client
        self.base_path = os.path.abspath(os.getcwd())
        # We still keep temp_ads_dir for the final rendered output
        self.temp_ads_dir = os.path.join(self.base_path, "temp_ads")
        os.makedirs(self.temp_ads_dir, exist_ok=True)

    async def create_ad_asset(
        self,
        product: str,
        base_url: str,
        image_bytes: bytes,  # NEW: Accept bytes from the manual upload
        brand_id: Optional[int] = None,
        discount: str = "",
        style: str = "Minimalist Luxury",
        features: str = "",
        description: str = "",
        detected_color: str = "#ffffff"
    ) -> str:
        remove_bg = False 

        # 1. Use tempfile to save the uploaded image bytes
        # 'delete=False' is used because Playwright needs to access the file via URL 
        # while this function is still running.
        with tempfile.NamedTemporaryFile(suffix=".png", dir=self.temp_ads_dir, delete=False) as tf:
            tf.write(image_bytes)
            temp_img_path = tf.name
        
        try:
            filename = os.path.basename(temp_img_path)
            # Ensure your FastAPI app serves 'temp_ads' as a static route
            product_img_url = f"{base_url}/temp_ads/{filename}"

            # 2. Simplified Background Instruction
            bg_instruction = "Keep Background" if not remove_bg else "Remove Background"
            
            # 3. Brand Context
            brand_section = ""
            if brand_id:
                brand = self.brand_service.get_brand(brand_id)
                if brand:
                    brand_section = BRAND_CONTEXT_SECTION.format(
                        brand_name=brand.name,
                        brand_tone=brand.tone,
                        brand_tagline=brand.tagline or "N/A",
                        style_guidelines=brand.style_guidelines or "Standard luxury layout"
                    )

            # 4. Prompt Assembly
            final_prompt = VISUAL_AD_PROMPT.format(
                brand_section=brand_section,
                product=product,
                style=style,
                discount=discount,
                features=features,
                product_img_url=product_img_url,
                description=description,
                bg_instruction=bg_instruction,
                detected_color=detected_color
            )

            # 5. Gemini HTML Generation (Fixed model name to 2.0)
            response = self.client.models.generate_content(
                model="gemini-2.5-flash", 
                contents=final_prompt
            )
            html_code = _clean_llm_html(response.text)

            # 6. Sanitize for Filename
            clean_name = re.sub(r'[^\w\s-]', '', product).strip().lower()
            clean_name = re.sub(r'[-\s]+', '_', clean_name)
            
            # 7. Playwright Render
            out_png_path = os.path.join(self.temp_ads_dir, f"ad_{clean_name}.png")
            await asyncio.to_thread(_render_with_playwright, html_code, out_png_path)

            return out_png_path

        finally:
            # Note: You might want to delay deletion if you want the user to see the 
            # intermediate image, but usually, once the ad is rendered, 
            # we can clean up the source temp file.
            if os.path.exists(temp_img_path):
                os.remove(temp_img_path)