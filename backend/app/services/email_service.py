"""
Email Generation Service.

Implements personalized marketing email generation using LLM.
Flow: Recipient Data + Product Info + Brand Guidelines → LLM generates personalized email variants
"""

from google import genai
from dotenv import load_dotenv
import os
import json
from typing import Optional, List

from app.models.email import (
    EmailGenerationRequest,
    EmailGenerationResponse,
    EmailVariant,
    RecipientPersona,
    BatchEmailRequest,
    BatchEmailResponse
)
from app.prompts.email_generation import (
    SYSTEM_PROMPT,
    EMAIL_TYPE_CONTEXTS,
    TONE_GUIDELINES,
    PERSONALIZATION_PROMPT,
    BRAND_CONTEXT_PROMPT,
    EMAIL_GENERATION_PROMPT,
    AB_TESTING_TIPS
)
from app.services.brand_service import get_brand

load_dotenv()

# Initialize Gemini client
gemini_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


def _build_personalization_context(recipient: RecipientPersona) -> str:
    """Build personalization context string from recipient data."""
    if not recipient:
        return "No personalization data provided - generate a generic but warm email."
    
    context_parts = []
    
    # Name
    if recipient.first_name:
        context_parts.append(f"- Name: {recipient.first_name} {recipient.last_name or ''}".strip())
    
    # Interests
    if recipient.interests:
        context_parts.append(f"- Interests: {', '.join(recipient.interests)}")
    
    # Purchase History
    if recipient.purchase_history:
        context_parts.append(f"- Recent purchases: {', '.join(recipient.purchase_history)}")
    
    # Browsing History
    if recipient.browsing_history:
        context_parts.append(f"- Recently viewed: {', '.join(recipient.browsing_history)}")
    
    # Engagement Level
    if recipient.engagement_level:
        context_parts.append(f"- Engagement level: {recipient.engagement_level.value}")
    
    # Purchase Metrics
    if recipient.last_purchase_days is not None:
        context_parts.append(f"- Days since last purchase: {recipient.last_purchase_days}")
    
    if recipient.total_orders is not None:
        context_parts.append(f"- Total orders: {recipient.total_orders}")
    
    if recipient.average_order_value is not None:
        context_parts.append(f"- Average order value: ${recipient.average_order_value:.2f}")
    
    # Demographics
    if recipient.location:
        context_parts.append(f"- Location: {recipient.location}")
    
    if recipient.age_group:
        context_parts.append(f"- Age group: {recipient.age_group}")
    
    # Preferences
    if recipient.preferred_categories:
        context_parts.append(f"- Preferred categories: {', '.join(recipient.preferred_categories)}")
    
    return "\n".join(context_parts) if context_parts else "Limited personalization data available."


def _build_brand_context(brand_id: Optional[int]) -> str:
    """Build brand context string from brand profile."""
    if not brand_id:
        return ""
    
    brand = get_brand(brand_id)
    if not brand:
        return ""
    
    context_parts = [
        f"Brand Name: {brand.name}",
        f"Brand Tone: {brand.tone.value if hasattr(brand.tone, 'value') else brand.tone}",
    ]
    
    if brand.tagline:
        context_parts.append(f"Tagline: {brand.tagline}")
    
    if brand.values:
        context_parts.append(f"Brand Values: {', '.join(brand.values)}")
    
    if brand.keywords_include:
        context_parts.append(f"Preferred Keywords: {', '.join(brand.keywords_include)}")
    
    if brand.keywords_avoid:
        context_parts.append(f"AVOID these words: {', '.join(brand.keywords_avoid)}")
    
    if brand.style_guidelines:
        context_parts.append(f"Style Guidelines: {brand.style_guidelines}")
    
    return "\n".join(context_parts)


def _parse_llm_response(response_text: str) -> dict:
    """Parse the LLM response to extract JSON."""
    try:
        # Clean up the response
        text = response_text.strip()
        
        # Try to extract JSON from markdown code blocks
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        return json.loads(text)
    except json.JSONDecodeError as e:
        # Attempt to fix common JSON issues
        try:
            # Remove trailing commas
            import re
            text = re.sub(r',\s*}', '}', text)
            text = re.sub(r',\s*]', ']', text)
            return json.loads(text)
        except:
            raise ValueError(f"Failed to parse LLM response as JSON: {e}")


async def generate_email(request: EmailGenerationRequest) -> EmailGenerationResponse:
    """
    Generate personalized marketing email variants.
    
    Flow:
    1. Build personalization context from recipient data
    2. Build brand context if brand_id provided
    3. Assemble the complete prompt with all contexts
    4. Call LLM to generate email variants
    5. Parse and return structured response
    """
    try:
        # Get email type context
        email_type_context = EMAIL_TYPE_CONTEXTS.get(
            request.email_type.value, 
            EMAIL_TYPE_CONTEXTS["promotional"]
        )
        
        # Get tone guideline
        tone_guideline = TONE_GUIDELINES.get(
            request.email_tone.value,
            TONE_GUIDELINES["friendly"]
        )
        
        # Build personalization section
        personalization_section = ""
        personalization_used = {}
        
        if request.recipient:
            personalization_context = _build_personalization_context(request.recipient)
            personalization_section = PERSONALIZATION_PROMPT.format(
                personalization_context=personalization_context
            )
            
            # Track what personalization was used
            if request.recipient.first_name:
                personalization_used["name"] = request.recipient.first_name
            if request.recipient.interests:
                personalization_used["interests"] = request.recipient.interests
            if request.recipient.engagement_level:
                personalization_used["engagement"] = request.recipient.engagement_level.value
            if request.recipient.purchase_history:
                personalization_used["purchase_history"] = request.recipient.purchase_history
        
        # Build brand section
        brand_section = ""
        brand_name = None
        
        if request.brand_id:
            brand_context = _build_brand_context(request.brand_id)
            if brand_context:
                brand_section = BRAND_CONTEXT_PROMPT.format(brand_context=brand_context)
                brand = get_brand(request.brand_id)
                if brand:
                    brand_name = brand.name
        
        # Build product info
        product_info = request.product_name or "General marketing"
        if request.product_description:
            product_info += f" - {request.product_description}"
        
        # Max length instruction
        max_length_instruction = ""
        if request.max_body_length:
            max_length_instruction = f"Maximum body length: {request.max_body_length} characters"
        
        # Assemble the complete prompt
        complete_prompt = EMAIL_GENERATION_PROMPT.format(
            system_prompt=SYSTEM_PROMPT,
            email_type_context=email_type_context,
            tone_guideline=tone_guideline,
            personalization_section=personalization_section,
            brand_section=brand_section,
            product_info=product_info,
            offer_details=request.offer_details or "No specific offer",
            offer_expiry=request.offer_expiry or "Not specified",
            cta_goal=request.cta_goal,
            target_audience=request.target_audience.value,
            include_emojis="Yes, use emojis appropriately" if request.include_emojis else "No emojis",
            max_length_instruction=max_length_instruction,
            num_variants=request.generate_variants
        )
        
        # Call Gemini API
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=complete_prompt
        )
        
        # Parse the response
        parsed_response = _parse_llm_response(response.text)
        
        # Build email variants
        variants = []
        for variant_data in parsed_response.get("variants", []):
            variant = EmailVariant(
                subject_line=variant_data.get("subject_line", ""),
                preview_text=variant_data.get("preview_text", ""),
                greeting=variant_data.get("greeting", ""),
                body=variant_data.get("body", ""),
                cta_text=variant_data.get("cta_text", request.cta_goal),
                closing=variant_data.get("closing", ""),
                ps_line=variant_data.get("ps_line"),
                social_proof=variant_data.get("social_proof")
            )
            variants.append(variant)
        
        # Get tips from response or use defaults
        tips = parsed_response.get("tips", [])
        if not tips:
            # Add relevant A/B testing tips based on email type
            tips = AB_TESTING_TIPS.get("subject_lines", [])[:2]
        
        return EmailGenerationResponse(
            success=True,
            email_type=request.email_type.value,
            variants=variants,
            personalization_used=personalization_used,
            brand_applied=brand_name,
            tips=tips
        )
        
    except Exception as e:
        return EmailGenerationResponse(
            success=False,
            email_type=request.email_type.value,
            variants=[],
            error=str(e)
        )


async def generate_batch_emails(batch_request: BatchEmailRequest) -> BatchEmailResponse:
    """
    Generate personalized emails for multiple recipients.
    
    Uses the same base email configuration but personalizes for each recipient.
    """
    emails = []
    errors = []
    successful = 0
    
    for recipient in batch_request.recipients:
        try:
            # Create a request for this recipient
            individual_request = EmailGenerationRequest(
                email_type=batch_request.base_request.email_type,
                email_tone=batch_request.base_request.email_tone,
                product_name=batch_request.base_request.product_name,
                product_description=batch_request.base_request.product_description,
                offer_details=batch_request.base_request.offer_details,
                offer_expiry=batch_request.base_request.offer_expiry,
                cta_goal=batch_request.base_request.cta_goal,
                cta_url=batch_request.base_request.cta_url,
                recipient=recipient,  # Use the individual recipient
                target_audience=batch_request.base_request.target_audience,
                brand_id=batch_request.base_request.brand_id,
                include_emojis=batch_request.base_request.include_emojis,
                max_body_length=batch_request.base_request.max_body_length,
                generate_variants=1,  # Generate only 1 variant per recipient in batch
                campaign_name=batch_request.base_request.campaign_name,
                additional_context=batch_request.base_request.additional_context
            )
            
            result = await generate_email(individual_request)
            emails.append(result)
            
            if result.success:
                successful += 1
            else:
                errors.append(f"Failed for {recipient.email or recipient.first_name}: {result.error}")
                
        except Exception as e:
            errors.append(f"Error for {recipient.email or recipient.first_name}: {str(e)}")
    
    return BatchEmailResponse(
        success=successful > 0,
        total_recipients=len(batch_request.recipients),
        successful_generations=successful,
        emails=emails,
        errors=errors
    )


async def generate_email_preview(request: EmailGenerationRequest) -> str:
    """
    Generate a simple HTML preview of the email.
    
    Useful for quickly visualizing how the email will look.
    """
    email_response = await generate_email(request)
    
    if not email_response.success or not email_response.variants:
        return f"<html><body><h1>Error</h1><p>{email_response.error}</p></body></html>"
    
    # Take the first variant for preview
    variant = email_response.variants[0]
    
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }}
            .email-container {{
                background: white;
                border-radius: 8px;
                padding: 32px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }}
            .subject-preview {{
                background: #e8e8e8;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 20px;
            }}
            .subject-line {{
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 4px;
            }}
            .preview-text {{
                color: #666;
                font-size: 12px;
            }}
            .greeting {{
                font-size: 18px;
                margin-bottom: 16px;
            }}
            .body-content {{
                line-height: 1.6;
                color: #333;
                margin-bottom: 24px;
                white-space: pre-wrap;
            }}
            .cta-button {{
                display: inline-block;
                background: #007bff;
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 16px 0;
            }}
            .closing {{
                margin-top: 24px;
                color: #555;
            }}
            .ps-line {{
                margin-top: 20px;
                font-style: italic;
                color: #666;
                border-top: 1px solid #eee;
                padding-top: 16px;
            }}
            .social-proof {{
                background: #f8f9fa;
                padding: 12px;
                border-radius: 4px;
                margin-top: 16px;
                font-style: italic;
                color: #555;
            }}
        </style>
    </head>
    <body>
        <div class="subject-preview">
            <div class="subject-line">Subject: {variant.subject_line}</div>
            <div class="preview-text">Preview: {variant.preview_text}</div>
        </div>
        <div class="email-container">
            <div class="greeting">{variant.greeting}</div>
            <div class="body-content">{variant.body}</div>
            <a href="#" class="cta-button">{variant.cta_text}</a>
            <div class="closing">{variant.closing}</div>
            {f'<div class="ps-line">P.S. {variant.ps_line}</div>' if variant.ps_line else ''}
            {f'<div class="social-proof">"{variant.social_proof}"</div>' if variant.social_proof else ''}
        </div>
    </body>
    </html>
    """
    
    return html_template
