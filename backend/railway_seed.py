import os
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from app.database import SessionLocal, Base, engine
from app.models import Product

def seed_minimal():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if db.query(Product).count() > 0:
        print(f"Database has {db.query(Product).count()} products")
        db.close()
        return
    test_products = [Product(id=f"PROD_{i:04d}",title=f"Eyeglasses {i}",category="Eyeglasses",collection_tag="trending",frame_shape="Rectangle",price=999.00+(i*100),stock_count=50,ar_asset_url="https://via.placeholder.com/400") for i in range(1,21)]
    db.add_all(test_products)
    db.commit()
    print(f"Seeded {len(test_products)} products")
    db.close()

if __name__ == "__main__":
    seed_minimal()
