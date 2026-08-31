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
# 5. AR Telemetry (Enhanced with Session Tracking)
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
    
    # Session tracking (new fields for advanced analytics)
    session_id = Column(Text, nullable=True, index=True)  # UUID v4 session identifier
    page_url = Column(Text, nullable=True)                # Full URL where event occurred
    referrer = Column(Text, nullable=True)                # Referrer URL (campaign tracking)
    user_agent = Column(Text, nullable=True)              # Browser/device info
    
    # Relationships
    user_ref = relationship("User", back_populates="ar_events")
    product_ref = relationship("Product", back_populates="ar_events")


# ─────────────────────────────────────────────────────────────────────────────
# 6. User Sessions (New table for session analytics)
# ─────────────────────────────────────────────────────────────────────────────
class UserSession(Base):
    __tablename__ = "user_sessions"

    session_id = Column(Text, primary_key=True, default=_uuid)
    user_id = Column(Text, ForeignKey("users.id"), nullable=True, index=True)
    started_at = Column(DateTime, default=_now, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    last_activity_at = Column(DateTime, default=_now, nullable=False)
    
    # Session context
    landing_page = Column(Text, nullable=True)            # First page visited
    referrer = Column(Text, nullable=True)                # Traffic source
    user_agent = Column(Text, nullable=True)              # Browser/device
    ip_address = Column(Text, nullable=True)              # IP (anonymized for GDPR)
    
    # Session metrics
    page_views = Column(Integer, default=0, nullable=False)
    events_count = Column(Integer, default=0, nullable=False)
    converted = Column(Boolean, default=False, nullable=False)  # Did they purchase?
    
    # Relationships
    user_ref = relationship("User", foreign_keys=[user_id])


# ─────────────────────────────────────────────────────────────────────────────
# 7. Conversion Funnel Events (New table for funnel analytics)
# ─────────────────────────────────────────────────────────────────────────────
class FunnelEvent(Base):
    __tablename__ = "funnel_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Text, ForeignKey("user_sessions.session_id"), nullable=False, index=True)
    user_id = Column(Text, ForeignKey("users.id"), nullable=True, index=True)
    funnel_stage = Column(Text, nullable=False, index=True)
    # funnel_stage: landing | browse_products | view_product | try_ar | add_to_cart | checkout | payment | completed
    product_id = Column(Text, ForeignKey("products.id"), nullable=True)
    timestamp = Column(DateTime, default=_now, nullable=False)
    metadata = Column(Text, nullable=True)  # JSON string for additional data
    
    # Relationships
    session_ref = relationship("UserSession", foreign_keys=[session_id])
    user_ref = relationship("User", foreign_keys=[user_id])
    product_ref = relationship("Product", foreign_keys=[product_id])


# ─────────────────────────────────────────────────────────────────────────────
# 8. Heatmap Data (New table for click/interaction heatmaps)
# ─────────────────────────────────────────────────────────────────────────────
class HeatmapData(Base):
    __tablename__ = "heatmap_data"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Text, ForeignKey("user_sessions.session_id"), nullable=False, index=True)
    page_path = Column(Text, nullable=False, index=True)  # e.g., /products/123
    event_type = Column(Text, nullable=False)             # click | mousemove | scroll
    x_coordinate = Column(Integer, nullable=True)         # X position (pixels)
    y_coordinate = Column(Integer, nullable=True)         # Y position (pixels)
    viewport_width = Column(Integer, nullable=True)       # Viewport dimensions
    viewport_height = Column(Integer, nullable=True)
    element_id = Column(Text, nullable=True)              # DOM element ID
    element_class = Column(Text, nullable=True)           # DOM element class
    timestamp = Column(DateTime, default=_now, nullable=False)
    
    # Relationships
    session_ref = relationship("UserSession", foreign_keys=[session_id])


# ─────────────────────────────────────────────────────────────────────────────
# 9. A/B Test Experiments (New table for A/B testing)
# ─────────────────────────────────────────────────────────────────────────────
class ABTestExperiment(Base):
    __tablename__ = "ab_test_experiments"

    experiment_id = Column(Text, primary_key=True, default=_uuid)
    name = Column(Text, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Variant configuration (JSON string)
    variants_config = Column(Text, nullable=False)  # JSON: [{"name": "control", "weight": 50}, {"name": "variant_a", "weight": 50}]
    
    created_at = Column(DateTime, default=_now, nullable=False)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)


# ─────────────────────────────────────────────────────────────────────────────
# 10. A/B Test Assignments (New table for user variant assignments)
# ─────────────────────────────────────────────────────────────────────────────
class ABTestAssignment(Base):
    __tablename__ = "ab_test_assignments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    experiment_id = Column(Text, ForeignKey("ab_test_experiments.experiment_id"), nullable=False, index=True)
    session_id = Column(Text, ForeignKey("user_sessions.session_id"), nullable=False, index=True)
    user_id = Column(Text, ForeignKey("users.id"), nullable=True, index=True)
    variant_name = Column(Text, nullable=False)
    assigned_at = Column(DateTime, default=_now, nullable=False)
    converted = Column(Boolean, default=False, nullable=False)  # Did this variant convert?
    
    # Relationships
    experiment_ref = relationship("ABTestExperiment", foreign_keys=[experiment_id])
    session_ref = relationship("UserSession", foreign_keys=[session_id])
    user_ref = relationship("User", foreign_keys=[user_id])
