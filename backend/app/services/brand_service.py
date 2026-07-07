from typing import Optional
from sqlalchemy.orm import Session
from app.models.brand import BrandProfile, BrandProfileCreate, BrandProfileUpdate
from app.models.brand_db import BrandDB
from app.database import SessionLocal, init_db

# Initialize database on module load
init_db()


def _get_db() -> Session:
    """Get a database session."""
    return SessionLocal()


def create_brand(brand_data: BrandProfileCreate) -> BrandProfile:
    """Create a new brand profile."""
    db = _get_db()
    try:
        db_brand = BrandDB.from_dict(brand_data.model_dump())
        db.add(db_brand)
        db.commit()
        db.refresh(db_brand)
        return BrandProfile(**db_brand.to_dict())
    finally:
        db.close()


def get_brand(brand_id: int) -> Optional[BrandProfile]:
    """Get a brand profile by ID."""
    db = _get_db()
    try:
        db_brand = db.query(BrandDB).filter(BrandDB.id == brand_id).first()
        if db_brand:
            return BrandProfile(**db_brand.to_dict())
        return None
    finally:
        db.close()


def get_all_brands() -> list[BrandProfile]:
    """Get all brand profiles."""
    db = _get_db()
    try:
        db_brands = db.query(BrandDB).all()
        return [BrandProfile(**b.to_dict()) for b in db_brands]
    finally:
        db.close()


def update_brand(brand_id: int, brand_data: BrandProfileUpdate) -> Optional[BrandProfile]:
    """Update a brand profile."""
    db = _get_db()
    try:
        db_brand = db.query(BrandDB).filter(BrandDB.id == brand_id).first()
        if not db_brand:
            return None
        
        # Update only provided fields
        update_data = brand_data.model_dump(exclude_unset=True)
        
        # Handle tone enum conversion
        if "tone" in update_data and update_data["tone"] is not None:
            update_data["tone"] = update_data["tone"].value if hasattr(update_data["tone"], "value") else update_data["tone"]
        
        # Handle list fields (need to be JSON serialized)
        import json
        for field in ["values", "keywords_include", "keywords_avoid", "example_posts"]:
            if field in update_data and update_data[field] is not None:
                update_data[field] = json.dumps(update_data[field])
        
        for key, value in update_data.items():
            setattr(db_brand, key, value)
        
        db.commit()
        db.refresh(db_brand)
        return BrandProfile(**db_brand.to_dict())
    finally:
        db.close()


def delete_brand(brand_id: int) -> bool:
    """Delete a brand profile."""
    db = _get_db()
    try:
        db_brand = db.query(BrandDB).filter(BrandDB.id == brand_id).first()
        if not db_brand:
            return False
        
        db.delete(db_brand)
        db.commit()
        return True
    finally:
        db.close()


def get_brand_context(brand_id: int) -> Optional[str]:
    """
    Generate a context string for LLM prompts based on brand profile.
    This is used to inject brand voice into content generation.
    """
    brand = get_brand(brand_id)
    if not brand:
        return None
    
    context_parts = [
        f"Brand: {brand.name}",
        f"Tone: {brand.tone.value}",
    ]
    
    if brand.tagline:
        context_parts.append(f"Tagline: {brand.tagline}")
    
    if brand.values:
        context_parts.append(f"Core Values: {', '.join(brand.values)}")
    
    if brand.keywords_include:
        context_parts.append(f"Preferred Keywords: {', '.join(brand.keywords_include)}")
    
    if brand.keywords_avoid:
        context_parts.append(f"Words to AVOID: {', '.join(brand.keywords_avoid)}")
    
    if brand.target_emotion:
        context_parts.append(f"Target Emotion: {brand.target_emotion}")
    
    if brand.style_guidelines:
        context_parts.append(f"Style Guidelines: {brand.style_guidelines}")
    
    if brand.example_posts:
        context_parts.append("Example Posts (match this style):")
        for i, post in enumerate(brand.example_posts[:3], 1):
            context_parts.append(f"  {i}. {post}")
    
    return "\n".join(context_parts)
