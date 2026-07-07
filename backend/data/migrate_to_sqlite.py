"""
Migration script to move existing brands from JSON to SQLite.
Run this once after setting up the SQLite database.
"""
import json
from pathlib import Path
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import init_db, SessionLocal
from app.models.brand_db import BrandDB

JSON_FILE = Path(__file__).parent / "brands.json"


def migrate_brands():
    """Migrate brands from JSON file to SQLite database."""
    # Initialize database tables
    init_db()
    
    # Check if JSON file exists
    if not JSON_FILE.exists():
        print("No brands.json file found. Nothing to migrate.")
        return
    
    # Load brands from JSON
    with open(JSON_FILE, "r") as f:
        brands = json.load(f)
    
    if not brands:
        print("No brands found in JSON file.")
        return
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if brands already exist in database
        existing_count = db.query(BrandDB).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} brands. Skipping migration.")
            print("If you want to re-migrate, delete the app.db file first.")
            return
        
        # Migrate each brand
        for brand_data in brands:
            # Convert tone to string if it's an enum
            if "tone" in brand_data and hasattr(brand_data["tone"], "value"):
                brand_data["tone"] = brand_data["tone"].value
            
            db_brand = BrandDB.from_dict(brand_data)
            # Don't set ID, let SQLite auto-generate it
            db_brand.id = None
            db.add(db_brand)
        
        db.commit()
        print(f"Successfully migrated {len(brands)} brand(s) to SQLite database.")
        
        # Optionally backup the old JSON file
        backup_file = JSON_FILE.with_suffix(".json.bak")
        JSON_FILE.rename(backup_file)
        print(f"Original JSON file backed up to: {backup_file}")
        
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate_brands()
