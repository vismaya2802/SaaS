"""
main.py — FastAPI application entry point.
Run with: uvicorn app.main:app --reload  (from backend/ directory)
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, products, cart, promos, payment, telemetry, dashboard


# ─── Lifespan: DB auto-migration on startup ───────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure the data/ directory exists so SQLite can write the .db file
    os.makedirs("data", exist_ok=True)
    # Create all tables (idempotent; safe to run every boot in dev)
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created / verified.")
    yield
    print("[SHUTDOWN] VisionFrame backend stopping.")


# ─── App factory ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="VisionFrame Luxury Eyewear",
    description=(
        "VisionFrame SaaS Platform — Luxury Eyewear E-commerce.\n\n"
        "Backend: FastAPI + SQLAlchemy + SQLite + WebSockets.\n"
        "Analytics: PowerBI Push Dataset (streamed via Python SDK)."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Get CORS origins from environment variable or use defaults
cors_origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else [
    "http://localhost:5173",           # Vite default dev port
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://visionframe-app.vercel.app",  # Production Vercel URL
    "https://*.vercel.app",            # All Vercel preview deployments
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
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
app.include_router(dashboard.router)


# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "visionframe-backend", "version": "1.0.0"}

# ─── Root endpoint ────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "VisionFrame API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }
