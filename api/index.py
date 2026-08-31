"""
Vercel Serverless Function Handler for FastAPI
This file makes the FastAPI app compatible with Vercel's serverless Python runtime.
"""
import sys
import os

# Add the backend directory to Python path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.main import app

# Vercel expects a variable named 'app' or 'handler'
handler = app
