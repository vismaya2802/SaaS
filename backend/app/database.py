"""
database.py — SQLAlchemy engine, session factory, and Base declarative class.
All models import Base from here; all routers depend-inject `get_db`.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# ─── SQLite database URL ──────────────────────────────────────────────────────
# File is stored at backend/data/lenskart.db (relative to CWD of uvicorn)
SQLALCHEMY_DATABASE_URL = "sqlite:///./data/lenskart.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite + FastAPI
    echo=False,  # Set True for SQL debug logs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Single declarative base shared by all ORM models."""
    pass


# ─── Dependency injector ──────────────────────────────────────────────────────
def get_db():
    """FastAPI dependency that yields a DB session and guarantees cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
