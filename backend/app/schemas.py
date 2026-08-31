"""
schemas.py — Pydantic v2 request / response schemas for all API endpoints.
These form the exact API contract between frontend and backend.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ═════════════════════════════════════════════════════════════════════════════
# AUTH
# ═════════════════════════════════════════════════════════════════════════════
class OTPRequest(BaseModel):
    identifier: str = Field(..., description="Mobile number or email")


class OTPResponse(BaseModel):
    message: str
    # In production this would NOT return the OTP; only for mock/demo
    mock_otp: str = Field(..., description="6-digit mock OTP (dev only)")


class OTPVerifyRequest(BaseModel):
    identifier: str
    otp: str = Field(..., min_length=6, max_length=6)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str


# ═════════════════════════════════════════════════════════════════════════════
# PRODUCTS
# ═════════════════════════════════════════════════════════════════════════════
class ProductOut(BaseModel):
    id: str
    title: str
    category: str
    collection_tag: Optional[str] = None
    frame_shape: Optional[str] = None
    price: float
    stock_count: int
    ar_asset_url: Optional[str] = None

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    total: int
    products: list[ProductOut]


# ═════════════════════════════════════════════════════════════════════════════
# PROMO CODES
# ═════════════════════════════════════════════════════════════════════════════
class PromoValidateRequest(BaseModel):
    code: str
    cart_amount: float = Field(..., gt=0)


class PromoValidateResponse(BaseModel):
    valid: bool
    discount_amount: float
    final_amount: float
    message: str


# ═════════════════════════════════════════════════════════════════════════════
# CART
# ═════════════════════════════════════════════════════════════════════════════
class CartAddRequest(BaseModel):
    user_id: str
    product_id: str
    lens_type: str = Field(
        ...,
        description="single_vision | bifocal | zero_power | sunglasses",
    )
    quantity: int = Field(default=1, ge=1)


class CartAddResponse(BaseModel):
    success: bool
    message: str
    cart_item_count: int


# ═════════════════════════════════════════════════════════════════════════════
# PAYMENT
# ═════════════════════════════════════════════════════════════════════════════
class PaymentOrderRequest(BaseModel):
    user_id: str
    cart_amount: float = Field(..., gt=0)
    promo_code: Optional[str] = None
    payment_method: str = Field(
        ..., description="upi | card | netbanking | cod"
    )


class PaymentOrderResponse(BaseModel):
    order_id: str          # ORD-XXXXX format
    razorpay_order_id: str # Mock Razorpay order id
    amount: float
    currency: str = "INR"
    status: str = "created"


class PaymentVerifyRequest(BaseModel):
    order_id: str
    razorpay_payment_id: str  # Mock value from frontend
    razorpay_signature: str   # Mock HMAC signature


class PaymentVerifyResponse(BaseModel):
    success: bool
    order_id: str
    payment_status: str
    message: str


# ═════════════════════════════════════════════════════════════════════════════
# TELEMETRY (Enhanced with Session Tracking)
# ═════════════════════════════════════════════════════════════════════════════
class TelemetryEventRequest(BaseModel):
    user_id: Optional[str] = None
    product_id: str
    event_type: str = Field(
        ...,
        description="try_on_start | try_on_end | screenshot | add_to_cart_from_ar",
    )
    dwell_time_seconds: int = Field(default=0, ge=0)
    
    # Session tracking fields (optional for backward compatibility)
    session_id: Optional[str] = None
    page_url: Optional[str] = None
    referrer: Optional[str] = None
    user_agent: Optional[str] = None


class TelemetryEventResponse(BaseModel):
    recorded: bool
    event_id: int
    streamed_to_powerbi: bool


# ═════════════════════════════════════════════════════════════════════════════
# SESSION TRACKING
# ═════════════════════════════════════════════════════════════════════════════
class SessionCreateRequest(BaseModel):
    user_id: Optional[str] = None
    landing_page: Optional[str] = None
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None


class SessionCreateResponse(BaseModel):
    session_id: str
    started_at: datetime


class SessionUpdateRequest(BaseModel):
    session_id: str
    last_activity_at: Optional[datetime] = None
    page_views: Optional[int] = None
    events_count: Optional[int] = None
    converted: Optional[bool] = None


# ═════════════════════════════════════════════════════════════════════════════
# FUNNEL TRACKING
# ═════════════════════════════════════════════════════════════════════════════
class FunnelEventRequest(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    funnel_stage: str = Field(
        ...,
        description="landing | browse_products | view_product | try_ar | add_to_cart | checkout | payment | completed"
    )
    product_id: Optional[str] = None
    metadata: Optional[str] = None  # JSON string


class FunnelEventResponse(BaseModel):
    recorded: bool
    event_id: int


class FunnelAnalyticsResponse(BaseModel):
    funnel_stage: str
    total_users: int
    conversion_rate: float
    drop_off_rate: float


# ═════════════════════════════════════════════════════════════════════════════
# HEATMAP TRACKING
# ═════════════════════════════════════════════════════════════════════════════
class HeatmapEventRequest(BaseModel):
    session_id: str
    page_path: str
    event_type: str = Field(..., description="click | mousemove | scroll")
    x_coordinate: Optional[int] = None
    y_coordinate: Optional[int] = None
    viewport_width: Optional[int] = None
    viewport_height: Optional[int] = None
    element_id: Optional[str] = None
    element_class: Optional[str] = None


class HeatmapEventResponse(BaseModel):
    recorded: bool
    event_id: int


class HeatmapDataPoint(BaseModel):
    x: int
    y: int
    intensity: int  # Number of events at this coordinate


class HeatmapAnalyticsResponse(BaseModel):
    page_path: str
    total_events: int
    data_points: list[HeatmapDataPoint]


# ═════════════════════════════════════════════════════════════════════════════
# A/B TESTING
# ═════════════════════════════════════════════════════════════════════════════
class ABTestVariantConfig(BaseModel):
    name: str
    weight: int = Field(..., ge=0, le=100)


class ABTestExperimentCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    variants: list[ABTestVariantConfig] = Field(..., min_length=2)


class ABTestExperimentResponse(BaseModel):
    experiment_id: str
    name: str
    description: Optional[str] = None
    is_active: bool
    variants: list[ABTestVariantConfig]


class ABTestAssignmentRequest(BaseModel):
    experiment_name: str
    session_id: str
    user_id: Optional[str] = None


class ABTestAssignmentResponse(BaseModel):
    experiment_id: str
    variant_name: str
    assigned_at: datetime
