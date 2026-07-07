from sqlalchemy import Column, Integer, String, Text
from app.database import Base
import json


class BrandDB(Base):
    """SQLAlchemy model for brand profiles."""
    
    __tablename__ = "brands"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    tone = Column(String(50), nullable=False)
    tagline = Column(String(500), nullable=True)
    values = Column(Text, nullable=True)  # Stored as JSON string
    keywords_include = Column(Text, nullable=True)  # Stored as JSON string
    keywords_avoid = Column(Text, nullable=True)  # Stored as JSON string
    target_emotion = Column(String(100), nullable=True)
    example_posts = Column(Text, nullable=True)  # Stored as JSON string
    style_guidelines = Column(Text, nullable=True)
    
    def to_dict(self) -> dict:
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "tone": self.tone,
            "tagline": self.tagline,
            "values": json.loads(self.values) if self.values else [],
            "keywords_include": json.loads(self.keywords_include) if self.keywords_include else [],
            "keywords_avoid": json.loads(self.keywords_avoid) if self.keywords_avoid else [],
            "target_emotion": self.target_emotion,
            "example_posts": json.loads(self.example_posts) if self.example_posts else [],
            "style_guidelines": self.style_guidelines,
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "BrandDB":
        """Create model from dictionary."""
        return cls(
            id=data.get("id"),
            name=data["name"],
            tone=data["tone"] if isinstance(data["tone"], str) else data["tone"].value,
            tagline=data.get("tagline"),
            values=json.dumps(data.get("values", [])),
            keywords_include=json.dumps(data.get("keywords_include", [])),
            keywords_avoid=json.dumps(data.get("keywords_avoid", [])),
            target_emotion=data.get("target_emotion"),
            example_posts=json.dumps(data.get("example_posts", [])),
            style_guidelines=data.get("style_guidelines"),
        )
