import os
import re
import io
import uuid
import logging
import asyncio
import numpy as np
import cv2
from PIL import Image
from rembg import remove
from rembg.session_factory import new_session
from playwright.sync_api import sync_playwright

# Setup logging
logger = logging.getLogger("adgen.visual")
RMBG_SESSION = new_session("isnet-general-use")

# def ultra_cutout(image_bytes: bytes) -> bytes:
#     """Refined background removal with morphology cleanup and tight cropping."""
#     # 1) Initial Remove
#     cut = remove(image_bytes, session=RMBG_SESSION)
#     img = Image.open(io.BytesIO(cut)).convert("RGBA")
#     rgba = np.array(img).astype(np.uint8)

#     rgb = rgba[..., :3]
#     a = rgba[..., 3]

#     # 2) Mask Cleanup
#     mask = (a > 25).astype(np.uint8) * 255
#     k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
#     mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, k, iterations=1)
#     mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k, iterations=2)

#     # 3) Edge Refining
#     mask = cv2.erode(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)), iterations=1)
#     alpha = cv2.GaussianBlur(mask, (0, 0), sigmaX=1.0, sigmaY=1.0)

#     # 4) Alpha Blend
#     alpha_f = (alpha.astype(np.float32) / 255.0)[..., None]
#     rgb_blur = cv2.GaussianBlur(rgb, (0, 0), sigmaX=2.0, sigmaY=2.0)
#     rgb_clean = (rgb * alpha_f + rgb_blur * (1 - alpha_f)).astype(np.uint8)
#     out = np.dstack([rgb_clean, alpha.astype(np.uint8)])

#     # 5) Tight Crop
#     ys, xs = np.where(alpha > 10)
#     if len(xs) and len(ys):
#         x1, x2, y1, y2 = xs.min(), xs.max(), ys.min(), ys.max()
#         pad = 12
#         x1, y1 = max(0, x1-pad), max(0, y1-pad)
#         x2, y2 = min(out.shape[1]-1, x2+pad), min(out.shape[0]-1, y2+pad)
#         out = out[y1:y2+1, x1:x2+1]

#     out_img = Image.fromarray(out, "RGBA")
#     buf = io.BytesIO()
#     out_img.save(buf, format="PNG", optimize=True)
#     return buf.getvalue()

def _clean_llm_html(raw_html: str) -> str:
    if not raw_html:
        raise ValueError("LLM returned empty response")
    return re.sub(r"```(?:html)?", "", raw_html).replace("```", "").strip()

def _render_with_playwright(clean_html: str, out_png: str) -> None:
    """Sync playwright rendering, meant to be run in a thread."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 800, "height": 800}, bypass_csp=True)
        
        try:
            page.set_content(clean_html, wait_until="domcontentloaded")
            # Wait for product image to load if present
            page.wait_for_function(
                "() => { const img = document.querySelector('img.product-img'); return !img || (img.complete && img.naturalWidth > 0); }",
                timeout=15000
            )
            page.wait_for_timeout(500) # Small buffer for CSS animations

            card = page.locator(".ad-card")
            if card.count() > 0:
                card.first.screenshot(path=out_png, omit_background=True)
            else:
                page.screenshot(path=out_png)
        finally:
            browser.close()