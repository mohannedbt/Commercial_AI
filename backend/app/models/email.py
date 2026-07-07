"""
Email Generation Models.

Pydantic models for personalized marketing email generation.
Supports recipient personalization, email type variants, and brand consistency.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from app.enums.target_audience import TargetAudience


class EmailType(str, Enum):
    """Types of marketing emails that can be generated."""
    PROMOTIONAL = "promotional"        # Sales, discounts, special offers
    WELCOME = "welcome"               # New subscriber/customer welcome
    NEWSLETTER = "newsletter"         # Regular content updates
    ABANDONED_CART = "abandoned_cart" # Cart recovery emails
    RE_ENGAGEMENT = "re_engagement"   # Win-back inactive customers
    PRODUCT_LAUNCH = "product_launch" # New product announcements
    THANK_YOU = "thank_you"           # Post-purchase appreciation
    SEASONAL = "seasonal"             # Holiday/seasonal campaigns
    FEEDBACK = "feedback"             # Request reviews/feedback
    LOYALTY = "loyalty"               # Rewards/loyalty program


class EmailTone(str, Enum):
    """Tone options for email content."""
    FRIENDLY = "friendly"
    PROFESSIONAL = "professional"
    URGENT = "urgent"
    CASUAL = "casual"
    LUXURIOUS = "luxurious"
    PLAYFUL = "playful"
    INSPIRATIONAL = "inspirational"


class EngagementLevel(str, Enum):
    """Customer engagement levels for personalization."""
    HIGH = "High"        # Active, frequent purchaser
    MEDIUM = "Medium"    # Occasional engagement
    LOW = "Low"          # Inactive, needs re-engagement


class RecipientPersona(BaseModel):
    """
    Recipient data for email personalization.
    
    This model captures customer attributes used to personalize
    email content, making it more relevant and engaging.
    """
    # Basic Info
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    
    # Behavioral Data
    interests: Optional[List[str]] = Field(
        default=None,
        description="Customer interests/preferences (e.g., ['electronics', 'fitness', 'travel'])"
    )
    purchase_history: Optional[List[str]] = Field(
        default=None,
        description="Recent purchases (e.g., ['Running Shoes', 'Fitness Tracker'])"
    )
    browsing_history: Optional[List[str]] = Field(
        default=None,
        description="Recently viewed products/categories"
    )
    
    # Engagement Metrics
    engagement_level: Optional[EngagementLevel] = Field(
        default=None,
        description="Customer engagement level based on activity"
    )
    last_purchase_days: Optional[int] = Field(
        default=None,
        description="Days since last purchase"
    )
    total_orders: Optional[int] = Field(
        default=None,
        description="Total number of orders"
    )
    average_order_value: Optional[float] = Field(
        default=None,
        description="Average order value in dollars"
    )
    
    # Demographics
    location: Optional[str] = Field(
        default=None,
        description="Customer location (city, country)"
    )
    age_group: Optional[str] = Field(
        default=None,
        description="Age group (e.g., '25-34', '35-44')"
    )
    
    # Preferences
    preferred_categories: Optional[List[str]] = Field(
        default=None,
        description="Preferred product categories"
    )
    communication_preference: Optional[str] = Field(
        default=None,
        description="Preferred communication style"
    )


class EmailGenerationRequest(BaseModel):
    """
    Request model for generating personalized marketing emails.
    
    Supports various email types, personalization levels, and brand consistency.
    """
    # Email Configuration
    email_type: EmailType = Field(
        default=EmailType.PROMOTIONAL,
        description="Type of marketing email to generate"
    )
    email_tone: EmailTone = Field(
        default=EmailTone.FRIENDLY,
        description="Desired tone for the email"
    )
    
    # Product/Offer Information
    product_name: Optional[str] = Field(
        default=None,
        description="Name of the product being promoted"
    )
    product_description: Optional[str] = Field(
        default=None,
        description="Brief description of the product"
    )
    offer_details: Optional[str] = Field(
        default=None,
        description="Promotional offer details (e.g., '20% off', 'Free shipping')"
    )
    offer_expiry: Optional[str] = Field(
        default=None,
        description="Offer expiration date/time"
    )
    
    # Call to Action
    cta_goal: str = Field(
        default="Shop Now",
        description="Primary call-to-action goal"
    )
    cta_url: Optional[str] = Field(
        default=None,
        description="URL for the call-to-action button"
    )
    
    # Personalization
    recipient: Optional[RecipientPersona] = Field(
        default=None,
        description="Recipient data for personalization"
    )
    
    # Targeting
    target_audience: TargetAudience = Field(
        default=TargetAudience.Adults,
        description="Target audience segment"
    )
    
    # Brand Consistency
    brand_id: Optional[int] = Field(
        default=None,
        description="Brand ID for consistent voice and style"
    )
    
    # Generation Options
    include_emojis: bool = Field(
        default=True,
        description="Whether to include emojis in the email"
    )
    max_body_length: Optional[int] = Field(
        default=None,
        description="Maximum character length for email body"
    )
    generate_variants: int = Field(
        default=2,
        ge=1,
        le=5,
        description="Number of email variants to generate (1-5)"
    )
    
    # Additional Context
    campaign_name: Optional[str] = Field(
        default=None,
        description="Name of the marketing campaign"
    )
    additional_context: Optional[str] = Field(
        default=None,
        description="Any additional context or instructions"
    )


class EmailVariant(BaseModel):
    """A single email variant with all components."""
    subject_line: str = Field(description="Email subject line")
    preview_text: str = Field(description="Email preview/preheader text")
    greeting: str = Field(description="Personalized greeting")
    body: str = Field(description="Main email body content")
    cta_text: str = Field(description="Call-to-action button text")
    closing: str = Field(description="Email closing/sign-off")
    
    # Optional components
    ps_line: Optional[str] = Field(
        default=None,
        description="P.S. line for additional urgency or info"
    )
    social_proof: Optional[str] = Field(
        default=None,
        description="Testimonial or social proof snippet"
    )


class EmailGenerationResponse(BaseModel):
    """Response containing generated email variants."""
    success: bool
    email_type: str
    variants: List[EmailVariant]
    personalization_used: dict = Field(
        default_factory=dict,
        description="Summary of personalization data used"
    )
    brand_applied: Optional[str] = Field(
        default=None,
        description="Brand name if brand guidelines were applied"
    )
    tips: List[str] = Field(
        default_factory=list,
        description="Tips for improving email performance"
    )
    error: Optional[str] = None


class BatchEmailRequest(BaseModel):
    """Request for generating personalized emails for multiple recipients."""
    base_request: EmailGenerationRequest
    recipients: List[RecipientPersona]


class BatchEmailResponse(BaseModel):
    """Response containing emails for multiple recipients."""
    success: bool
    total_recipients: int
    successful_generations: int
    emails: List[EmailGenerationResponse]
    errors: List[str] = Field(default_factory=list)
