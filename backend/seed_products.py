"""
seed_products.py — Initialize database with sample products
Run this script to seed the database with 1,010 products from CSV
"""
import os
import sys
import pandas as pd
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, Base, engine
from app.models import Product

def seed_database():
    """Seed database with products from CSV file"""
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Check if database already has products
    db = SessionLocal()
    existing_count = db.query(Product).count()
    
    if existing_count > 0:
        print(f"✅ Database already has {existing_count} products. Skipping seed.")
        db.close()
        return
    
    # Load CSV file
    csv_path = Path(__file__).parent / "data" / "seed_data.csv"
    
    if not csv_path.exists():
        print(f"❌ Error: {csv_path} not found")
        db.close()
        return
    
    print(f"📂 Loading products from {csv_path}")
    df = pd.read_csv(csv_path)
    
    # Insert products
    products_added = 0
    for _, row in df.iterrows():
        product = Product(
            id=row['id'],
            title=row['title'],
            category=row['category'],
            collection_tag=row.get('collection_tag', 'trending'),
            frame_shape=row.get('frame_shape', 'Rectangle'),
            price=float(row['price']),
            stock_count=int(row.get('stock_count', 50)),
            ar_asset_url=row.get('ar_asset_url', '')
        )
        db.add(product)
        products_added += 1
        
        # Commit in batches of 100
        if products_added % 100 == 0:
            db.commit()
            print(f"  ✓ {products_added} products added...")
    
    # Final commit
    db.commit()
    print(f"✅ Successfully seeded {products_added} products!")
    
    db.close()

if __name__ == "__main__":
    seed_database()
