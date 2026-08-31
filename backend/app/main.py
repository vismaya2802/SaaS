"""
main.py — FastAPI application entry point.
Run with: uvicorn app.main:app --reload  (from backend/ directory)
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, products, cart, promos, payment, telemetry


# ─── Lifespan: DB auto-migration on startup ───────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure the data/ directory exists so SQLite can write the .db file
    os.makedirs("data", exist_ok=True)
    # Create all tables (idempotent; safe to run every boot in dev)
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created / verified.")
    yield
    print("[SHUTDOWN] Lenskart SaaS backend stopping.")


# ─── App factory ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="VisionFrame v3.0",
    description=(
        "College Project — Zero-Defect, $0.00 Deployment.\n\n"
        "Backend: FastAPI + SQLAlchemy + SQLite + WebSockets.\n"
        "Analytics: PowerBI Push Dataset (streamed via Python SDK)."
    ),
    version="3.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite default dev port
        "http://localhost:3000",
        "https://saasvf.vercel.app",  # Production Vercel URL
        "https://*.vercel.app",     # All Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/api/auth",     tags=["Auth"])
app.include_router(products.router,  prefix="/api/products", tags=["Products"])
app.include_router(cart.router,      prefix="/api/cart",     tags=["Cart"])
app.include_router(promos.router,    prefix="/api/promos",   tags=["Promos"])
app.include_router(payment.router,   prefix="/api/payment",  tags=["Payment"])
app.include_router(telemetry.router)


# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "visionframe-backend", "version": "3.0.0"}

