"""
models.py — SQLAlchemy ORM models matching the SoW relational schema exactly.
Run `create_all` on startup to auto-migrate (suitable for dev / college demo).
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    DateTime,
)
from sqlalchemy.orm import relationship

from app.database import Base


# ─── Helper ───────────────────────────────────────────────────────────────────
def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ─────────────────────────────────────────────────────────────────────────────
# 1. Users
# ─────────────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Text, primary_key=True, default=_uuid)
    identifier = Column(Text, unique=True, nullable=False, index=True)
    # 'identifier' is the mobile number or email used during OTP login
    created_at = Column(DateTime, default=_now, nullable=False)

    # Relationships
    orders = relationship("Order", back_populates="user")
    ar_events = relationship("ARTelemetry", back_populates="user_ref")


# ─────────────────────────────────────────────────────────────────────────────
# 2. Promo Codes
# ─────────────────────────────────────────────────────────────────────────────
class PromoCode(Base):
    __tablename__ = "promo_codes"

    code = Column(Text, primary_key=True)
    discount_percentage = Column(Float, nullable=False)
    max_discount_amount = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    orders = relationship("Order", back_populates="promo_ref")


# ─────────────────────────────────────────────────────────────────────────────
# 3. Products
# ─────────────────────────────────────────────────────────────────────────────
class Product(Base):
    __tablename__ = "products"

    id = Column(Text, primary_key=True, default=_uuid)
    title = Column(Text, nullable=False)
    category = Column(Text, nullable=False)           # e.g. eyeglasses | sunglasses
    collection_tag = Column(Text, nullable=True)      # e.g. trending | new_arrival
    frame_shape = Column(Text, nullable=True)         # e.g. round | rectangle | cat-eye
    price = Column(Float, nullable=False)
    stock_count = Column(Integer, default=0, nullable=False)
    ar_asset_url = Column(Text, nullable=True)        # URL to GLTF/GLB 3-D model

    # Relationships
    ar_events = relationship("ARTelemetry", back_populates="product_ref")


# ─────────────────────────────────────────────────────────────────────────────
# 4. Orders
# ─────────────────────────────────────────────────────────────────────────────
class Order(Base):
    __tablename__ = "orders"

    id = Column(Text, primary_key=True, default=_uuid)
    user_id = Column(Text, ForeignKey("users.id"), nullable=False, index=True)
    total_amount = Column(Float, nullable=False)
    discount_applied = Column(Float, default=0.0, nullable=False)
    promo_code = Column(Text, ForeignKey("promo_codes.code"), nullable=True)
    payment_status = Column(Text, default="pending", nullable=False)
    # payment_status: pending | paid | failed | refunded
    payment_method = Column(Text, nullable=True)
    # payment_method: upi | card | netbanking | cod (all mocked)
    created_at = Column(DateTime, default=_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="orders")
    promo_ref = relationship("PromoCode", back_populates="orders")


# ─────────────────────────────────────────────────────────────────────────────
# 5. AR Telemetry
# ─────────────────────────────────────────────────────────────────────────────
class ARTelemetry(Base):
    __tablename__ = "ar_telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Text, ForeignKey("users.id"), nullable=True, index=True)
    product_id = Column(Text, ForeignKey("products.id"), nullable=False, index=True)
    event_type = Column(Text, nullable=False)
    # event_type: try_on_start | try_on_end | screenshot | add_to_cart_from_ar
    dwell_time_seconds = Column(Integer, default=0, nullable=False)
    timestamp = Column(DateTime, default=_now, nullable=False)

    # Relationships
    user_ref = relationship("User", back_populates="ar_events")
    product_ref = relationship("Product", back_populates="ar_events")
