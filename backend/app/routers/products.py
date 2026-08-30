"""
routers/products.py — Product catalogue endpoints.

GET /api/products  → list products with optional filters
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product
from app.schemas import ProductListResponse, ProductOut

router = APIRouter()


# ─── GET /api/products ────────────────────────────────────────────────────────
@router.get("", response_model=ProductListResponse)
def list_products(
    category: Optional[str] = Query(None, description="eyeglasses | sunglasses | lenses"),
    shape: Optional[str] = Query(None, description="round | rectangle | cat-eye | aviator"),
    collection_type: Optional[str] = Query(None, description="trending | new_arrival | premium"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
):
    """
    Return a paginated list of products.  
    Supports optional filters: category, frame_shape, collection_tag.
    """
    query = db.query(Product)

    if category:
        query = query.filter(Product.category == category)
    if shape:
        query = query.filter(Product.frame_shape == shape)
    if collection_type:
        query = query.filter(Product.collection_tag == collection_type)

    total = query.count()
    products = query.offset(skip).limit(limit).all()

    return ProductListResponse(
        total=total,
        products=[ProductOut.model_validate(p) for p in products],
    )


# ─── GET /api/products/{product_id} ──────────────────────────────────────────
@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Return a single product by ID."""
    from fastapi import HTTPException, status

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{product_id}' not found.",
        )
    return ProductOut.model_validate(product)
