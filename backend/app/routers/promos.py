"""
routers/promos.py — Promo code validation endpoint.

POST /api/promos/validate → validate a promo code against a cart amount
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PromoCode
from app.schemas import PromoValidateRequest, PromoValidateResponse

router = APIRouter()


# ─── POST /api/promos/validate ────────────────────────────────────────────────
@router.post("/validate", response_model=PromoValidateResponse)
def validate_promo(body: PromoValidateRequest, db: Session = Depends(get_db)):
    """
    Validate a promo code and compute the discount.

    Discount logic:
      discount = cart_amount * (discount_percentage / 100)
      discount = min(discount, max_discount_amount)
      final_amount = cart_amount - discount
    """
    promo = db.query(PromoCode).filter(PromoCode.code == body.code).first()

    if not promo or not promo.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promo code is invalid or inactive.",
        )

    raw_discount = body.cart_amount * (promo.discount_percentage / 100)
    discount = min(raw_discount, promo.max_discount_amount)
    final_amount = round(body.cart_amount - discount, 2)

    return PromoValidateResponse(
        valid=True,
        discount_amount=round(discount, 2),
        final_amount=final_amount,
        message=f"Promo '{promo.code}' applied! You save ₹{round(discount, 2):.2f}.",
    )
