"""
routers/auth.py — Mock OTP authentication endpoints.

POST /api/auth/otp     → generate & cache a 6-digit mock OTP
POST /api/auth/verify  → validate OTP, upsert user, return JWT
"""

import random
import string
from datetime import datetime, timedelta, timezone
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import OTPRequest, OTPResponse, OTPVerifyRequest, TokenResponse

router = APIRouter()

# ─── JWT config (use env var in production) ────────────────────────────────────
SECRET_KEY = "LENSKART_DEV_SECRET_CHANGE_IN_PROD"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 h

# ─── In-memory OTP store  { identifier: otp_string } ──────────────────────────
# NOTE: Replace with Redis in production for multi-process safety
_otp_store: Dict[str, str] = {}


def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def _create_access_token(user_id: str, identifier: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "identifier": identifier,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ─── POST /api/auth/otp ────────────────────────────────────────────────────────
@router.post("/otp", response_model=OTPResponse, status_code=status.HTTP_200_OK)
def request_otp(body: OTPRequest):
    """
    Generate a mock 6-digit OTP for the given mobile/email identifier.
    In production: send via SMS gateway or email. Here we just return it.
    """
    otp = _generate_otp()
    _otp_store[body.identifier] = otp
    # TODO: In production, dispatch OTP via SMS/email service — do NOT return it
    return OTPResponse(
        message=f"OTP sent to {body.identifier}",
        mock_otp=otp,
    )


# ─── POST /api/auth/verify ────────────────────────────────────────────────────
@router.post("/verify", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def verify_otp(body: OTPVerifyRequest, db: Session = Depends(get_db)):
    """
    Validate OTP → upsert user in DB → return JWT access token.
    """
    stored_otp = _otp_store.get(body.identifier)
    if stored_otp is None or stored_otp != body.otp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP.",
        )

    # Remove used OTP
    del _otp_store[body.identifier]

    # Upsert user
    user = db.query(User).filter(User.identifier == body.identifier).first()
    if not user:
        user = User(identifier=body.identifier)
        db.add(user)
        db.commit()
        db.refresh(user)

    token = _create_access_token(user.id, user.identifier)
    return TokenResponse(access_token=token, user_id=user.id)
