# 🚀 VisionFrame SaaS - Complete Walkthrough

## 📋 Project Overview

**VisionFrame** is a luxury eyewear e-commerce SaaS platform built as a college project. It features a full-stack architecture with AR virtual try-on, real-time telemetry, and advanced filtering capabilities.

**Tech Stack:**
- **Backend:** Python 3.9+ | FastAPI | SQLAlchemy | SQLite | WebSockets
- **Frontend:** React 18 | Vite | Tailwind CSS | Zustand
- **AR Engine:** MediaPipe (CDN) | Canvas API
- **Analytics:** Power BI (CSV streaming)

---

## ✅ Current Status

| Component | Status | URL |
|-----------|--------|-----|
| **GitHub** | ✅ Synced | `git@github-vismaya:vismaya2802/SaaS.git` |
| **Railway Backend** | ✅ Running | https://saasvf-production.up.railway.app |
| **Vercel Frontend** | ✅ Deploying | https://visionframe-app.vercel.app |

**Live URLs:**
- Frontend: https://visionframe-app.vercel.app
- Backend Health: https://saasvf-production.up.railway.app/health
- API Products: https://saasvf-production.up.railway.app/api/products

---

## 🏗️ Architecture

```
┌──────────────────────────────────────┐
│         Vercel (Frontend)            │
│   React + Vite (Port 5173)           │
│   Routes: /, /product/:id, /checkout │
└──────────────┬───────────────────────┘
               │
               │ HTTP API Calls (/api/*)
               ▼
┌──────────────────────────────────────┐
│      Railway (Backend)               │
│   FastAPI + Python (Port 8000)       │
│   SQLite Database                    │
└──────────────┬───────────────────────┘
               │
               │ WebSocket (Real-time)
               ▼
┌──────────────────────────────────────┐
│       Power BI Analytics             │
│   CSV Streaming (telemetry_stream)   │
└──────────────────────────────────────┘
```

---

## 📁 Project Structure

### Backend (`backend/`)

```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, routes
│   ├── database.py          # SQLite connection, session
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic validation schemas
│   └── routers/
│       ├── auth.py          # OTP login endpoints
│       ├── products.py      # Product CRUD + filters
│       ├── cart.py          # Cart management
│       ├── payment.py       # Payment processing
│       ├── promos.py        # Promo code validation
│       └── telemetry.py     # WebSocket + HTTP telemetry
├── data/
│   └── visionframe.db       # SQLite database (1,010 products)
├── requirements.txt         # Python dependencies
└── test_telemetry.py        # Telemetry verification script
```

**Key Backend Features:**
- ✅ 1,010 products (348 eyeglasses, 616 sunglasses, 46 lenses)
- ✅ OTP-based authentication (mock)
- ✅ Shopping cart management
- ✅ Promo code validation
- ✅ WebSocket telemetry streaming
- ✅ CSV rolling buffer for Power BI (100 records max)

---

### Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── main.jsx             # App entry point
│   ├── index.css            # Global styles (luxury theme)
│   ├── components/
│   │   ├── Navbar.jsx       # Top navigation
│   │   ├── HeroCarousel.jsx # Homepage hero (3 slides)
│   │   ├── ProductGrid.jsx  # Product listing + filters
│   │   ├── ARView.jsx       # AR try-on component
│   │   └── CartDrawer.jsx   # Shopping cart sidebar
│   ├── pages/
│   │   ├── Home.jsx         # Homepage (hero + products)
│   │   ├── ProductDetail.jsx # Product page + AR
│   │   └── Checkout.jsx     # Cart checkout
│   ├── context/
│   │   ├── AuthContext.jsx  # Auth state management
│   │   └── CartContext.jsx  # Cart state (Zustand)
│   ├── hooks/
│   │   ├── useMediaPipe.js  # AR/MediaPipe logic
│   │   └── useAPI.js        # Axios API client
│   └── ...
├── index.html               # HTML template (MediaPipe CDN)
├── tailwind.config.js       # Tailwind + luxury colors
├── vite.config.js           # Vite configuration
└── package.json             # Node dependencies
```

**Key Frontend Features:**
- ✅ Luxury gold/purple/charcoal theme
- ✅ Responsive product grid with filters
- ✅ MediaPipe AR face tracking
- ✅ SVG glasses overlay on canvas
- ✅ WebSocket telemetry streaming
- ✅ OTP authentication modal
- ✅ Shopping cart with Zustand

---

## 🎨 Luxury Theme

### Color Palette

**Primary (Gold):**
- `#facc15` (gold-400)
- `#eab308` (gold-500)
- `#ca8a04` (gold-600)

**Accent (Purple):**
- `#581c87` (luxury-900)
- `#7e22ce` (luxury-800)
- `#9333ea` (luxury-600)

**Background (Charcoal):**
- `#020617` (charcoal-950)
- `#0f172a` (charcoal-900)
- `#1e293b` (charcoal-800)

---

## 🔌 API Endpoints

### Health Check
```
GET /health
Response: {"status": "ok", "service": "visionframe-backend", "version": "1.0.0"}
```

### Authentication
```
POST /api/auth/otp              # Request OTP
POST /api/auth/verify           # Verify OTP, return JWT
```

### Products
```
GET  /api/products              # List products with filters
GET  /api/products/{id}         # Get single product
```

### Cart
```
POST /api/cart/add              # Add item to cart
GET  /api/cart/{user_id}        # Get cart items
```

### Telemetry
```
WS   /api/telemetry/ws/{user_id}   # WebSocket real-time
POST /api/telemetry/               # HTTP fallback
```

### Promo Codes
```
POST /api/promos/validate       # Validate promo code
```

### Payment
```
POST /api/payment/order         # Create payment order
POST /api/payment/verify        # Verify payment
```

---

## 🧪 Local Development Setup

### Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 16+** (for frontend)
- **Git** (for version control)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload
```

**Backend runs on:** http://localhost:8000

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs on:** http://localhost:5173

---

## 📡 Telemetry & Analytics

### Event Types

- `try_on_start` — User initiates AR try-on session
- `try_on_update` — Dwell time update during AR session
- `try_on_end` — User ends AR session

### CSV File Location

```
backend/telemetry_stream.csv
```

### CSV Format

```csv
userId,productId,eventType,dwellTimeSeconds,timestamp
test_user_001,PROD_8675309,try_on_start,0,2026-08-31T10:30:45.123456+00:00
test_user_001,PROD_8675309,try_on_update,2,2026-08-31T10:30:47.456789+00:00
```

### Power BI Integration

1. Open Power BI Desktop
2. Get Data → Text/CSV
3. Browse to: `backend/telemetry_stream.csv`
4. Load data and create visualizations
5. Set auto-refresh interval (5 minutes recommended)

---

## 🔧 Configuration Files

### Backend

**Environment Variables (Railway):**
```
CORS_ORIGINS=https://visionframe-app.vercel.app
PYTHONUNBUFFERED=1
DATABASE_URL=sqlite:///tmp/visionframe.db
```

**Key Files:**
- `Procfile` - Start command for Railway
- `requirements.txt` - Python dependencies
- `backend/app/main.py` - FastAPI app with CORS

### Frontend

**Environment Variables (Vercel):**
```
VITE_API_URL=https://saasvf-production.up.railway.app/api
PYTHONUNBUFFERED=1
```

**Key Files:**
- `vercel.json` - Monorepo deployment config
- `frontend/vite.config.js` - Vite build configuration
- `frontend/package.json` - Node dependencies

---

## 🚀 Deployment

### Backend (Railway)

1. Sign up at https://railway.app
2. Deploy from GitHub
3. Set root directory: `backend`
4. Add environment variables (see above)
5. Railway provides: https://your-app.up.railway.app

### Frontend (Vercel)

1. Sign up at https://vercel.com
2. Import GitHub repository
3. Set root directory: `frontend`
4. Add environment variables (see above)
5. Deploy automatically on push

### Monorepo Configuration

**vercel.json:**
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'fastapi'`
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Problem:** `Address already in use (port 8000)`
```bash
# Solution: Kill process using port 8000
# Windows:
netstat -ano | findstr "8000"
taskkill /PID <PID> /F
```

### Frontend Issues

**Problem:** `Port 5173 already in use`
```bash
# Solution: Use different port
npm run dev -- --port 3000
```

**Problem:** Tailwind CSS not loading
```bash
# Solution: Clear Vite cache and restart
rm -rf node_modules/.vite
npm run dev
```

### AR Try-On Issues

**Problem:** Glasses not visible on canvas
- Check MediaPipe CDN loading in browser console
- Verify canvas has width/height attributes
- Check camera permission is granted

**Problem:** Face not detected
- Ensure camera is working and streaming
- Check MediaPipe logs in browser console
- Verify face is facing camera with good lighting

---

## 📊 Database Schema

### Tables

1. **users** - User accounts (OTP authentication)
   - `id` (UUID)
   - `identifier` (mobile/email)
   - `created_at`

2. **products** - Product catalog (1,010 items)
   - `id` (UUID)
   - `title`, `category`, `collection_tag`
   - `frame_shape`, `price`, `stock_count`
   - `ar_asset_url`

3. **promo_codes** - Discount codes
   - `code` (primary key)
   - `discount_percentage`, `max_discount_amount`
   - `is_active`

4. **orders** - Purchase orders
   - `id` (UUID)
   - `user_id` (foreign key)
   - `total_amount`, `discount_applied`
   - `payment_status`, `payment_method`

5. **ar_telemetry** - AR session analytics
   - `id` (auto-increment)
   - `user_id`, `product_id` (foreign keys)
   - `event_type`, `dwell_time_seconds`
   - `timestamp`

---

## 📚 Documentation

### Key Files

| File | Purpose |
|------|---------|
| **README.md** | Project overview and API docs |
| **TELEMETRY.md** | Telemetry and analytics guide |
| **START_HERE.md** | Getting started guide |
| **GITHUB_WORKFLOW.md** | Git and GitHub workflows |
| **GIT_WORKFLOW.md** | Git hooks and conventions |

### Deployment Guides

| File | Purpose |
|------|---------|
| **DEPLOYMENT_GUIDE.md** | Production deployment |
| **VERCEL_SETUP_FIX.md** | Vercel configuration fix |
| **MONOREPO_DEPLOYMENT.md** | Monorepo deployment guide |

---

## ✅ Quick Reference

### Common Commands

```bash
# Git
git status                    # Check status
git add .                    # Stage changes
git commit -m "type(scope): msg"  # Commit
git push origin main         # Push to GitHub

# Backend
cd backend
uvicorn app.main:app --reload  # Start dev server

# Frontend
cd frontend
npm run dev                   # Start dev server
npm run build                 # Build for production
```

### Important URLs

- **GitHub:** https://github.com/vismaya2802/SaaS
- **Backend:** https://saasvf-production.up.railway.app
- **Frontend:** https://visionframe-app.vercel.app
- **API Docs:** https://saasvf-production.up.railway.app/docs

---

## 🎯 Development Checklist

### Daily Workflow
- [ ] Start backend: `cd backend && uvicorn app.main:app --reload`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Test endpoints in browser
- [ ] Check backend logs for errors
- [ ] Verify frontend console (F12) for errors

### Before Push
- [ ] Run tests: `cd backend && python test_telemetry.py`
- [ ] Check linting: `npm run lint` (if configured)
- [ ] Commit with conventional format
- [ ] Push to GitHub

---

## 📞 Support

For issues or questions:
1. Check this walkthrough first
2. Review specific documentation files
3. Check browser console (F12 → Console)
4. Check backend logs (terminal output)

---

**Version:** 1.0  
**Last Updated:** August 31, 2026  
**Status:** ✅ Production Ready  
**Project:** VisionFrame College SaaS Demo
