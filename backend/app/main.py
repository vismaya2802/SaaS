"""
main.py — FastAPI application entry point.
Run with: uvicorn app.main:app --reload  (from backend/ directory)
"""

import os
import threading
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, products, cart, promos, payment, telemetry, dashboard




# ─── Session Cleanup Background Job ──────────────────────────────────────────
def cleanup_expired_sessions():
    """Background thread to clean up expired sessions every hour"""
    from datetime import datetime, timezone, timedelta
    from app.database import SessionLocal
    from app.models import UserSession
    
    while True:
        time.sleep(3600)  # Run every hour
        db = SessionLocal()
        try:
            cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
            expired_count = db.query(UserSession).filter(
                UserSession.last_activity_at < cutoff,
                UserSession.ended_at == None
            ).update({'ended_at': datetime.now(timezone.utc)})
            db.commit()
            if expired_count > 0:
                print(f"[CLEANUP] Closed {expired_count} expired sessions")
        except Exception as e:
            print(f"[CLEANUP ERROR] {e}")
        finally:
            db.close()


# ─── Lifespan: DB auto-migration on startup ───────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure the data/ directory exists so SQLite can write the .db file
    os.makedirs("data", exist_ok=True)
    # Create all tables (idempotent; safe to run every boot in dev)
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created / verified.")
    
    # Start session cleanup background thread
    threading.Thread(target=cleanup_expired_sessions, daemon=True).start()
    print("[OK] Session cleanup thread started")
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
