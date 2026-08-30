"""
routers/payment.py — Mock Razorpay payment flow.

POST /api/payment/create-order → create order record, return mock Razorpay payload
POST /api/payment/verify       → verify mock signature, mark order as paid
"""

import random
import string
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order
from app.schemas import (
    PaymentOrderRequest,
    PaymentOrderResponse,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
)

router = APIRouter()


def _generate_order_number() -> str:
    """ORD-XXXXX  (5 alphanumeric characters)."""
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"ORD-{suffix}"


def _mock_razorpay_order_id() -> str:
    """Simulates a Razorpay order id: order_XXXXXXXXXXXXXXXX."""
    chars = string.ascii_letters + string.digits
    return "order_" + "".join(random.choices(chars, k=16))


# ─── POST /api/payment/create-order ──────────────────────────────────────────
@router.post(
    "/create-order",
    response_model=PaymentOrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_order(body: PaymentOrderRequest, db: Session = Depends(get_db)):
    """
    Create a new order record with 'pending' payment status.
    Returns a mock Razorpay order payload for the frontend checkout widget.
    """
    order_id = _generate_order_number()

    # Compute discount if promo provided
    discount_applied = 0.0
    final_amount = body.cart_amount
    if body.promo_code:
        from app.models import PromoCode

        promo = db.query(PromoCode).filter(PromoCode.code == body.promo_code).first()
        if promo and promo.is_active:
            raw = body.cart_amount * (promo.discount_percentage / 100)
            discount_applied = min(raw, promo.max_discount_amount)
            final_amount = round(body.cart_amount - discount_applied, 2)

    order = Order(
        id=order_id,
        user_id=body.user_id,
        total_amount=final_amount,
        discount_applied=round(discount_applied, 2),
        promo_code=body.promo_code,
        payment_status="pending",
        payment_method=body.payment_method,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return PaymentOrderResponse(
        order_id=order.id,
        razorpay_order_id=_mock_razorpay_order_id(),
        amount=final_amount,
    )


# ─── POST /api/payment/verify ─────────────────────────────────────────────────
@router.post("/verify", response_model=PaymentVerifyResponse)
def verify_payment(body: PaymentVerifyRequest, db: Session = Depends(get_db)):
    """
    Mock payment verification.
    In production: validate HMAC-SHA256 signature against Razorpay secret.
    Here: any non-empty signature is accepted and the order is marked 'paid'.
    """
    order = db.query(Order).filter(Order.id == body.order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{body.order_id}' not found.",
        )

    if not body.razorpay_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing payment signature.",
        )

    # TODO: Replace with real HMAC verification in production
    order.payment_status = "paid"
    db.commit()

    return PaymentVerifyResponse(
        success=True,
        order_id=order.id,
        payment_status="paid",
        message="Payment verified successfully. Order confirmed!",
    )
