# VisionFrame - Luxury Eyewear SaaS Platform

A production-ready, zero-defect eyewear e-commerce platform with advanced AR virtual try-on technology, real-time telemetry, and Power BI analytics integration.

## 🎨 Features

- **AR Virtual Try-On** - Real-time face detection with MediaPipe
- **1,010 Products** - Eyeglasses, Sunglasses, and Lenses
- **Smart Filters** - Category, shape, and collection filtering
- **WebSocket Telemetry** - Real-time analytics streaming to Power BI
- **Luxurious UI** - Gold gradient theme with glass-morphism effects
- **OTP Authentication** - Mobile login system
- **Shopping Cart** - Full e-commerce functionality

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 16+** (for frontend)
- **Git** (for version control)

### 1. Setup Project

```bash
# Navigate to project directory
cd lenskart-saas
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload
```

**Backend runs on:** http://localhost:8000

### 3. Frontend Setup

```bash
# Navigate to frontend (open NEW terminal)
cd frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs on:** http://localhost:5173

### 4. Access Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 📁 Project Structure

```
lenskart-saas/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app
│   │   ├── database.py             # SQLite setup
│   │   ├── models.py               # ORM models
│   │   ├── schemas.py              # Pydantic schemas
│   │   └── routers/
│   │       ├── auth.py             # Authentication
│   │       ├── products.py         # Product API
│   │       ├── cart.py             # Shopping cart
│   │       ├── payment.py          # Payment gateway
│   │       └── telemetry.py        # WebSocket telemetry
│   ├── data/
│   │   └── visionframe.db          # SQLite database
│   ├── requirements.txt            # Python dependencies
│   └── test_telemetry.py           # Telemetry test script
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   ├── HeroCarousel.jsx    # Hero section
│   │   │   ├── ProductGrid.jsx     # Product listing
│   │   │   ├── ARView.jsx          # AR try-on component
│   │   │   └── CartDrawer.jsx      # Shopping cart
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Homepage
│   │   │   ├── ProductDetail.jsx   # Product detail
│   │   │   └── Checkout.jsx        # Checkout page
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Authentication state
│   │   │   └── CartContext.jsx     # Cart state
│   │   ├── hooks/
│   │   │   ├── useMediaPipe.js     # AR/MediaPipe hook
│   │   │   └── useAPI.js           # API client
│   │   ├── index.css               # Global styles
│   │   └── main.jsx                # App entry point
│   ├── index.html                  # HTML template
│   ├── tailwind.config.js          # Tailwind configuration
│   ├── package.json                # Node dependencies
│   └── vite.config.js              # Vite configuration
│
├── README.md                        # This file
├── START_HERE.md                    # Getting started guide
├── TELEMETRY.md                     # Telemetry documentation
└── .gitignore                       # Git ignore rules
```

## 🎨 Color Scheme (Luxury Theme)

- **Primary (Gold):** #facc15 → #eab308 → #ca8a04
- **Accent (Purple):** #581c87 → #7e22ce → #9333ea
- **Background (Charcoal):** #020617 → #0f172a → #1e293b
- **Text:** #f3f4f6 (Light gray)

## 📊 Database Schema

### Tables

1. **users** - User accounts (OTP authentication)
2. **products** - Product catalog (1,010 items)
3. **promo_codes** - Discount codes
4. **orders** - Purchase orders
5. **ar_telemetry** - AR session analytics

### Sample Queries

```sql
-- Total products
SELECT COUNT(*) FROM products;
-- Result: 1,010

-- Eyeglasses count
SELECT COUNT(*) FROM products WHERE category = 'Eyeglasses';
-- Result: 348

-- Sunglasses count
SELECT COUNT(*) FROM products WHERE category = 'Sunglasses';
-- Result: 616
```

## 🔌 API Endpoints

### Health Check
```
GET /health
```

### Authentication
```
POST /api/auth/otp              # Request OTP
POST /api/auth/verify-otp       # Verify OTP
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

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:8000/health
```

### Telemetry Test
```bash
cd backend
python test_telemetry.py
```

### Product API Test
```bash
curl "http://localhost:8000/api/products?category=eyeglasses"
```

## 📈 Power BI Integration

### CSV File Location
```
backend/telemetry_stream.csv
```

### Connection Steps
1. Open Power BI Desktop
2. Get Data → Text/CSV
3. Browse to: `backend/telemetry_stream.csv`
4. Load data and create visualizations
5. Set auto-refresh interval (5 minutes recommended)

### Metrics Available
- Try-on start/end events
- Dwell time per product
- User engagement tracking
- Session timestamps

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check port availability
netstat -ano | findstr "8000"
```

### Frontend Not Starting
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check port availability
netstat -ano | findstr "5173"
```

### Tailwind CSS Not Working
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

### AR Try-On Not Working
1. **Hard refresh browser:** Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. **Check MediaPipe CDN:** View browser console for loading errors
3. **Grant camera permission:** Allow webcam access when prompted
4. **Check console:** Look for "✅ SVG glasses frame loaded" or "✅ Product image loaded"

### Products Not Displaying
1. **Check backend is running:** http://localhost:8000/health
2. **Check API response:** http://localhost:8000/api/products?category=eyeglasses
3. **Check browser console:** F12 → Console tab for errors
4. **Verify database:** Check `backend/data/visionframe.db` exists

## 🔧 Configuration

### Backend Configuration
File: `backend/app/main.py`
```python
# CORS settings
allow_origins=[
    "http://localhost:5173",   # Vite dev server
    "http://localhost:3000",   # Alternative port
]
```

### Frontend Configuration
File: `frontend/src/hooks/useAPI.js`
```javascript
// API base URL
const API_BASE_URL = "http://localhost:8000";
```

### Telemetry Configuration
File: `backend/app/routers/telemetry.py`
```python
MAX_RECORDS = 100              # CSV rolling buffer size
BUFFER_FLUSH_THRESHOLD = 5     # Records before CSV flush
```

## 🚀 Deployment

### Backend (Production)
```bash
# Use Gunicorn for production
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (Production)
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
Create `.env` files for production:

**Backend `.env`:**
```
DATABASE_URL=sqlite:///./data/visionframe.db
JWT_SECRET=your-secret-key-here
CORS_ORIGINS=https://your-domain.com
```

**Frontend `.env`:**
```
VITE_API_BASE_URL=https://api.your-domain.com
```

## 📝 License

This is a college project for educational purposes.

## 👥 Contributors

- Vismaya College Project Team

## 📞 Support

For issues or questions:
1. Check this README first
2. Review START_HERE.md for getting started
3. Check TELEMETRY.md for telemetry-specific issues
4. Check backend logs: `uvicorn app.main:app --reload` output
5. Check browser console: F12 → Console tab

## 🎯 Demo Checklist

Before demonstrating the application:

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] Database has 1,010 products
- [ ] Hard refresh browser (Ctrl+F5)
- [ ] Verify luxurious gold theme is applied
- [ ] Test AR try-on with webcam
- [ ] Test product filters
- [ ] Test add to cart
- [ ] Verify telemetry CSV is updating

---

**Version:** Luxury Edition  
**Last Updated:** August 31, 2026  
**Status:** ✅ Production Ready  
**Project:** VisionFrame College SaaS Demo
