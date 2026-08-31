# CRITICAL: VisionFrame Production Deployment

## Issue: No Products on Vercel

Vercel Serverless has limitations:
- SQLite resets on every deploy (no persistent filesystem)
- WebSocket not supported  
- Cold starts 5-10 seconds

## SOLUTION: Use Railway for Backend

1. Deploy Frontend to Vercel (perfect for React)
2. Deploy Backend to Railway (perfect for FastAPI + SQLite)

Both have FREE tiers.

## Quick Setup:

Backend on Railway:
- Sign up: https://railway.app
- Deploy from GitHub
- Set root directory: backend
- Add CORS_ORIGINS env variable
- Railway provides: https://your-app.up.railway.app

Frontend on Vercel:
- Set VITE_API_URL to Railway URL
- Deploy frontend folder only

See full guide in repository documentation.
