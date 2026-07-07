"""
Email Generation Prompts.

Comprehensive prompt templates for generating personalized marketing emails.
Supports multiple email types, tones, and personalization levels while
maintaining brand consistency.
"""

# =============================================================================
# SYSTEM PROMPT - Core instructions for email generation
# =============================================================================

SYSTEM_PROMPT = """You are an expert email marketing copywriter with 15+ years of experience.
You craft highly personalized, conversion-focused marketing emails that:
- Feel personal and human, not robotic or generic
- Drive action through compelling copy and clear CTAs
- Maintain brand voice consistency
- Use psychological triggers appropriately (urgency, social proof, exclusivity)
- Follow email marketing best practices (short paragraphs, scannable content)

IMPORTANT GUIDELINES:
1. Personalization should feel natural, not forced
2. Subject lines should be 40-60 characters, intriguing but not clickbait
3. Preview text should complement the subject line
4. Body copy should be concise and benefit-focused
5. Every email needs a clear, single primary CTA
6. Include a P.S. line when appropriate for urgency or bonus offers
"""

# =============================================================================
# EMAIL TYPE CONTEXTS - Specific guidance for each email type
# =============================================================================

EMAIL_TYPE_CONTEXTS = {
    "promotional": """
PROMOTIONAL EMAIL CONTEXT:
- Goal: Drive immediate sales/conversions
- Key elements: Clear offer, urgency, value proposition
- Best practices: 
  * Lead with the offer
  * Use social proof if available
  * Create urgency (limited time/quantity)
  * Make savings crystal clear
""",
    
    "welcome": """
WELCOME EMAIL CONTEXT:
- Goal: Make a great first impression, set expectations
- Key elements: Warm greeting, brand introduction, next steps
- Best practices:
  * Express genuine gratitude
  * Share what they can expect
  * Provide immediate value (discount, resource)
  * Guide them to their first action
""",
    
    "newsletter": """
NEWSLETTER EMAIL CONTEXT:
- Goal: Provide value, maintain engagement, build relationship
- Key elements: Valuable content, updates, curated resources
- Best practices:
  * Lead with most valuable content
  * Use clear section headers
  * Mix content types
  * Include one primary CTA
""",
    
    "abandoned_cart": """
ABANDONED CART EMAIL CONTEXT:
- Goal: Recover the sale, address objections
- Key elements: Product reminder, urgency, help offer
- Best practices:
  * Mention specific products they left
  * Address common objections
  * Offer help (not just discounts)
  * Create urgency (stock running low, cart expires)
""",
    
    "re_engagement": """
RE-ENGAGEMENT EMAIL CONTEXT:
- Goal: Win back inactive customers
- Key elements: We miss you sentiment, special incentive, easy return
- Best practices:
  * Acknowledge the time away without guilt
  * Highlight what's new/improved
  * Offer compelling incentive to return
  * Make it easy to re-engage
""",
    
    "product_launch": """
PRODUCT LAUNCH EMAIL CONTEXT:
- Goal: Generate excitement and early sales
- Key elements: New product showcase, benefits, exclusivity
- Best practices:
  * Build anticipation
  * Focus on benefits over features
  * Offer early access/special pricing
  * Use visuals descriptions
""",
    
    "thank_you": """
THANK YOU EMAIL CONTEXT:
- Goal: Show appreciation, encourage repeat business
- Key elements: Gratitude, order summary, next steps
- Best practices:
  * Be genuinely grateful
  * Set expectations for delivery/service
  * Suggest complementary products subtly
  * Ask for feedback/review
""",
    
    "seasonal": """
SEASONAL/HOLIDAY EMAIL CONTEXT:
- Goal: Capitalize on seasonal buying intent
- Key elements: Holiday theme, timely offers, gift focus
- Best practices:
  * Match the seasonal energy
  * Create urgency around shipping deadlines
  * Position as perfect gift solutions
  * Use seasonal imagery descriptions
""",
    
    "feedback": """
FEEDBACK REQUEST EMAIL CONTEXT:
- Goal: Gather reviews and testimonials
- Key elements: Easy ask, clear benefit, simple process
- Best practices:
  * Ask at the right time (post-delivery)
  * Make it super easy to respond
  * Explain why their feedback matters
  * Offer incentive if appropriate
""",
    
    "loyalty": """
LOYALTY/REWARDS EMAIL CONTEXT:
- Goal: Reward loyal customers, increase retention
- Key elements: Reward details, exclusivity, status recognition
- Best practices:
  * Celebrate their loyalty
  * Make them feel special/exclusive
  * Clear reward value explanation
  * Easy redemption path
"""
}

# =============================================================================
# TONE GUIDELINES - How to write in each tone
# =============================================================================

TONE_GUIDELINES = {
    "friendly": """
FRIENDLY TONE:
- Write like a helpful friend, not a salesperson
- Use contractions (you're, we're, it's)
- Include warm expressions
- Balance enthusiasm with authenticity
- Example: "Hey! We thought you'd love to know about this..."
""",
    
    "professional": """
PROFESSIONAL TONE:
- Maintain polished, business-appropriate language
- Avoid slang but stay accessible
- Focus on value and credibility
- Use data and specifics
- Example: "We're pleased to present an exclusive opportunity..."
""",
    
    "urgent": """
URGENT TONE:
- Create legitimate urgency without being pushy
- Use time-sensitive language
- Emphasize scarcity or deadlines
- Include countdown/deadline references
- Example: "Time is running out – only 24 hours left..."
""",
    
    "casual": """
CASUAL TONE:
- Keep it conversational and relaxed
- Use everyday language
- Feel free to use appropriate humor
- Short sentences, simple words
- Example: "Quick heads up – something cool is happening..."
""",
    
    "luxurious": """
LUXURIOUS TONE:
- Sophisticated, refined language
- Emphasize exclusivity and premium quality
- Use sensory, evocative descriptions
- Understated elegance, not flashy
- Example: "You're invited to experience something extraordinary..."
""",
    
    "playful": """
PLAYFUL TONE:
- Light, fun, energetic language
- Appropriate use of emojis and wordplay
- Creative, unexpected expressions
- Enthusiasm that feels genuine
- Example: "Guess what? We've got something that'll make your day! 🎉"
""",
    
    "inspirational": """
INSPIRATIONAL TONE:
- Motivating, uplifting language
- Focus on transformation and possibility
- Connect to bigger purpose/values
- Empower the reader
- Example: "Ready to take the next step in your journey?..."
"""
}

# =============================================================================
# PERSONALIZATION PROMPT - How to use recipient data
# =============================================================================

PERSONALIZATION_PROMPT = """
=== PERSONALIZATION DATA ===
Use the following recipient information to personalize the email naturally:

{personalization_context}

PERSONALIZATION RULES:
1. Use their name naturally in greeting and possibly once in body
2. Reference their interests/history when relevant (don't force it)
3. Adjust messaging based on engagement level:
   - High engagement: Reward loyalty, exclusive offers
   - Medium engagement: Gentle encouragement, value reminders
   - Low engagement: Win-back messaging, special incentives
4. Consider their purchase history for relevant recommendations
5. Location can inform seasonal references or shipping mentions
"""

# =============================================================================
# BRAND CONTEXT PROMPT - Maintaining brand voice
# =============================================================================

BRAND_CONTEXT_PROMPT = """
=== BRAND GUIDELINES ===
CRITICAL: The email MUST align with this brand's voice and style:

{brand_context}

Ensure the email:
- Matches the brand's established tone
- Uses preferred keywords naturally
- NEVER uses words from the brand's "avoid" list
- Feels authentic to this brand's personality
"""

# =============================================================================
# MAIN EMAIL GENERATION PROMPT - The complete prompt template
# =============================================================================

EMAIL_GENERATION_PROMPT = """
{system_prompt}

=== EMAIL TYPE ===
{email_type_context}

=== TONE REQUIREMENTS ===
{tone_guideline}

{personalization_section}

{brand_section}

=== EMAIL DETAILS ===
Product/Service: {product_info}
Offer Details: {offer_details}
Offer Expiry: {offer_expiry}
Primary CTA Goal: {cta_goal}
Target Audience: {target_audience}
Use Emojis: {include_emojis}
{max_length_instruction}

=== GENERATION TASK ===
Generate {num_variants} unique email variant(s). Each variant should have a different approach 
while maintaining the same core message and brand voice.

For each variant, provide:
1. subject_line: Compelling, 40-60 characters
2. preview_text: Complements subject, 40-90 characters  
3. greeting: Personalized opening
4. body: Main content (scannable paragraphs, benefit-focused)
5. cta_text: Clear action button text
6. closing: Sign-off with brand personality
7. ps_line: (optional) Post-script for urgency/bonus info
8. social_proof: (optional) Quick testimonial or social proof

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{{
    "variants": [
        {{
            "subject_line": "...",
            "preview_text": "...",
            "greeting": "...",
            "body": "...",
            "cta_text": "...",
            "closing": "...",
            "ps_line": "..." or null,
            "social_proof": "..." or null
        }}
    ],
    "tips": [
        "Tip for improving email performance...",
        "Another optimization suggestion..."
    ]
}}

Generate creative, high-converting email variants now:
"""

# =============================================================================
# A/B TESTING SUGGESTIONS - Tips for email optimization
# =============================================================================

AB_TESTING_TIPS = {
    "subject_lines": [
        "Test question vs. statement subject lines",
        "Try including numbers (e.g., '50% off' vs 'Half off')",
        "A/B test with and without emojis",
        "Compare urgency vs. curiosity approaches",
        "Test personalization in subject line"
    ],
    "ctas": [
        "Test action verbs (Shop vs. Get vs. Claim)",
        "Compare first-person vs second-person (Get My vs Get Your)",
        "Test button color impact on clicks",
        "Try different CTA placements"
    ],
    "content": [
        "Test long-form vs. short-form content",
        "Compare single CTA vs. multiple CTAs",
        "A/B test with and without social proof",
        "Try different personalization depths"
    ]
}

# =============================================================================
# SUBJECT LINE FORMULAS - Proven patterns for high open rates
# =============================================================================

SUBJECT_LINE_FORMULAS = {
    "urgency": "{Offer} ends {Time} ⏰",
    "curiosity": "You won't believe what we have for you...",
    "personal": "{Name}, this is just for you",
    "benefit": "Get {Benefit} with {Product}",
    "social_proof": "Join {Number} happy customers",
    "question": "Ready to {Desired Outcome}?",
    "exclusive": "VIP access: {Offer}",
    "new": "Just dropped: {Product}"
}
