# 📚 VisionFrame SaaS - Comprehensive Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Deployment Architecture](#deployment-architecture)
8. [Status Checklist](#status-checklist)
9. [What's Remaining](#whats-remaining)
10. [Future Enhancements](#future-enhancements)

---

## Project Overview

**VisionFrame** is a full-stack luxury eyewear e-commerce SaaS platform developed as a college project. The platform features:

- **1,010+ Products** - Eyeglasses, Sunglasses, and Lenses
- **AR Virtual Try-On** - Real-time face detection with MediaPipe
- **Real-time Telemetry** - WebSocket streaming to CSV/Power BI
- **Luxury UI/UX** - Gold/purple/charcoal theme with glass-morphism
- **Complete E-commerce** - Cart, Checkout, Payment (mock), Promo codes

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | Python | 3.9+ |
| **Framework** | FastAPI | 0.111.0+ |
| **Database** | SQLite | Built-in |
| **ORM** | SQLAlchemy | 2.0.30+ |
| **Frontend** | React | 18.3.1 |
| **Build Tool** | Vite | 5.3.3+ |
| **Styling** | Tailwind CSS | 3.4.6+ |
| **State** | Zustand | 4.5.4+ |
| **HTTP Client** | Axios | 1.7.2+ |
| **Routing** | React Router | 6.24.1+ |
| **AR Engine** | MediaPipe | 0.4.1633559619 |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Vercel (Frontend)                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  React 18 + Vite                    Port: 5173 (dev)                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │   │
│  │  │   Navbar    │  │   Hero      │  │  Product    │                  │   │
│  │  │   Components│  │   Carousel  │  │   Grid      │                  │   │
│  │  │             │  │             │  │             │                  │   │
│  │  │  Pages:     │  │  Pages:     │  │  Pages:     │                  │   │
│  │  │  - Home     │  │  - Home     │  │  - Product  │                  │   │
│  │  │  - Product  │  │  - Product  │  │  - Checkout │                  │   │
│  │  │  - Checkout │  │  - AR View  │  │             │                  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Context Providers                                           │   │   │
│  │  │  - AuthContext (JWT + OTP)                                   │   │   │
│  │  │  - CartContext (Zustand + localStorage)                      │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Hooks                                                       │   │   │
│  │  │  - useMediaPipe (AR face tracking)                           │   │   │
│  │  │  - useAPI (Axios client)                                     │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                              │ HTTPS API Calls (/api/*)
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Railway (Backend)                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  FastAPI                            Port: 8000 (dev)                 │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Routers (6)                                                │   │   │
│  │  │  - auth.py         OTP login                                │   │   │
│  │  │  - products.py     CRUD + filtering                         │   │   │
│  │  │  - cart.py         In-session cart                          │   │   │
│  │  │  - promos.py       Promo code validation                    │   │   │
│  │  │  - payment.py      Payment processing (mock)                │   │   │
│  │  │  - telemetry.py    WebSocket + HTTP                         │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Models (5)                                                  │   │   │
│  │  │  - User          OTP authentication                         │   │   │
│  │  │  - Product       1,010 items                                │   │   │
│  │  │  - PromoCode     Discount codes                             │   │   │
│  │  │  - Order         Purchase records                           │   │   │
│  │  │  - ARTelemetry   AR session analytics                       │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Services                                                    │   │   │
│  │  │  - powerbi_stream.py   PowerBI Push Dataset                 │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│  ┌───────────────────────────▼───────────────────────────────────────┐   │
│  │  SQLite Database: data/visionframe.db                             │   │
│  │  Tables: users, products, promo_codes, orders, ar_telemetry       │   │
│  └───────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                              │ WebSocket Streaming
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Power BI Analytics (Optional)                            │
│  CSV Streaming: telemetry_stream.csv (rolling 100 records)                  │
│  Auto-refresh: Every 5 minutes                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Backend Implementation

### Project Structure

```
backend/
├── app/
│   ├── __init__.py                  # Package initialization
│   ├── main.py                      # FastAPI app factory, CORS setup
│   ├── database.py                  # SQLAlchemy engine, session factory
│   ├── models.py                    # ORM models (5 tables)
│   ├── schemas.py                   # Pydantic schemas (10+)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py                  # OTP login endpoints
│   │   ├── products.py              # Product CRUD + filtering
│   │   ├── cart.py                  # In-session cart management
│   │   ├── promos.py                # Promo code validation
│   │   ├── payment.py               # Payment processing (mock)
│   │   └── telemetry.py             # WebSocket + HTTP telemetry
│   └── services/
│       ├── __init__.py
│       └── powerbi_stream.py        # PowerBI Push Dataset integration
├── data/
│   ├── visionframe.db               # SQLite database (auto-created)
│   └── seed_data.csv                # 1,010 products source
├── requirements.txt                 # Python dependencies
├── seed_products.py                 # Product seeding script
├── railway_seed.py                  # Railway auto-seed script
├── test_telemetry.py                # Telemetry verification script
└── telemetry_stream.csv             # Rolling CSV for PowerBI
```

### Key Implementation Details

#### 1. FastAPI Application (`app/main.py`)

**CORS Configuration:**
```python
# Environment variable: CORS_ORIGINS
# Format: comma-separated list of allowed origins
cors_origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else [
    "http://localhost:5173",           # Vite dev server
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://visionframe-app.vercel.app",  # Production Vercel
    "https://*.vercel.app",            # All Vercel preview deployments
]
```

**Lifespan (DB Auto-Migration):**
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("data", exist_ok=True)
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created / verified.")
    yield
    print("[SHUTDOWN] VisionFrame backend stopping.")
```

#### 2. Database Layer (`app/database.py`)

**SQLite Configuration:**
```python
SQLALCHEMY_DATABASE_URL = "sqlite:///./data/visionframe.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite + FastAPI
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

#### 3. ORM Models (`app/models.py`)

**Users:**
```python
class User(Base):
    __tablename__ = "users"
    id = Column(Text, primary_key=True, default=_uuid)
    identifier = Column(Text, unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=_now, nullable=False)
    # Relationships: orders, ar_events
```

**Products:**
```python
class Product(Base):
    __tablename__ = "products"
    id = Column(Text, primary_key=True, default=_uuid)
    title = Column(Text, nullable=False)
    category = Column(Text, nullable=False)           # Eyeglasses/Sunglasses/Lenses
    collection_tag = Column(Text, nullable=True)      # trending/new_arrival/premium
    frame_shape = Column(Text, nullable=True)         # Round/Rectangle/Cat-Eye/Aviator
    price = Column(Float, nullable=False)
    stock_count = Column(Integer, default=0)
    ar_asset_url = Column(Text, nullable=True)        # GLTF/GLB URL
```

**AR Telemetry:**
```python
class ARTelemetry(Base):
    __tablename__ = "ar_telemetry"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Text, ForeignKey("users.id"))
    product_id = Column(Text, ForeignKey("products.id"))
    event_type = Column(Text, nullable=False)         # try_on_start/try_on_end/...
    dwell_time_seconds = Column(Integer, default=0)
    timestamp = Column(DateTime, default=_now)
```

#### 4. Routers Implementation

**Auth Router (`routers/auth.py`):**
```python
# POST /api/auth/otp - Generate mock OTP
# POST /api/auth/verify - Verify OTP, upsert user, return JWT

_otp_store: Dict[str, str] = {}  # In-memory OTP store (replace with Redis in prod)

def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))

def _create_access_token(user_id: str, identifier: str) -> str:
    # JWT with 24-hour expiry
    expire = datetime.now(timezone.utc) + timedelta(minutes=1440)
    payload = {"sub": user_id, "identifier": identifier, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
```

**Products Router (`routers/products.py`):**
```python
# GET /api/products - List with filters (category, shape, collection_type)
# GET /api/products/{id} - Single product

@router.get("", response_model=ProductListResponse)
def list_products(
    category: Optional[str] = Query(None),
    shape: Optional[str] = Query(None),
    collection_type: Optional[str] = Query(None),
    skip: int = Query(default=0),
    limit: int = Query(default=20),
):
    query = db.query(Product)
    if category: query = query.filter(Product.category == category.capitalize())
    if shape: query = query.filter(Product.frame_shape == shape.capitalize())
    # ... pagination
```

**Cart Router (`routers/cart.py`):**
```python
# POST /api/cart/add - Add item to user's cart
# GET /api/cart/{user_id} - Get cart contents
# DELETE /api/cart/remove - Remove item

_cart_store: Dict[str, List[dict]] = {}  # In-memory cart (user_id -> items)
```

**Telemetry Router (`routers/telemetry.py`):**
```python
# WebSocket: /api/telemetry/ws/{user_id} - Real-time AR session streaming
# HTTP POST: /api/telemetry/ - Fallback event recording

# Rolling CSV buffer (100 records max, flush every 5 records)
LOCAL_STREAM_FILE = "telemetry_stream.csv"
MAX_RECORDS = 100
BUFFER_FLUSH_THRESHOLD = 5
```

#### 5. Telemetry System

**WebSocket Event Flow:**
```
Client → WebSocket → Process Event → Write to SQLite
                              ↓
                        Append to CSV Buffer
                              ↓
                    Flush to CSV (every 5 records)
                              ↓
                    PowerBI (if configured)
```

**Event Types:**
- `try_on_start` — AR session begins
- `try_on_update` — Dwell time update (every 3 seconds)
- `try_on_end` — AR session ends
- `screenshot` — User captures screenshot (future)
- `add_to_cart_from_ar` — Add from AR view (future)

**CSV Format:**
```csv
userId,productId,eventType,dwellTimeSeconds,timestamp
test_user_001,PROD_8675309,try_on_start,0,2026-08-31T10:30:45.123456+00:00
test_user_001,PROD_8675309,try_on_update,2,2026-08-31T10:30:47.456789+00:00
```

---

## Frontend Implementation

### Project Structure

```
frontend/
├── src/
│   ├── main.jsx                     # React 18 entry point
│   ├── index.css                    # Global styles (Tailwind + luxury theme)
│   ├── components/
│   │   ├── Navbar.jsx               # Top navigation (logo, cart, auth)
│   │   ├── HeroCarousel.jsx         # 3-slide hero with luxury gradients
│   │   ├── ProductGrid.jsx          # Product cards with filters
│   │   ├── ARView.jsx               # AR try-on component
│   │   ├── CartDrawer.jsx           # Slide-in cart sidebar
│   │   └── OTPModal.jsx             # OTP authentication modal
│   ├── pages/
│   │   ├── Home.jsx                 # Homepage (hero + products + filters)
│   │   ├── ProductDetail.jsx        # Product page + AR try-on
│   │   └── Checkout.jsx             # Multi-step checkout flow
│   ├── context/
│   │   ├── AuthContext.jsx          # JWT auth + OTP state
│   │   └── CartContext.jsx          # Zustand cart store
│   ├── hooks/
│   │   ├── useMediaPipe.js          # AR face tracking with MediaPipe
│   │   └── useAPI.js                # Axios instance with interceptors
│   └── App.jsx                      # Root with routing + providers
├── index.html                       # HTML template (MediaPipe CDN)
├── tailwind.config.js               # Tailwind config + luxury colors
├── vite.config.js                   # Vite configuration
└── package.json                     # Node dependencies
```

### Key Implementation Details

#### 1. AR Try-On (`useMediaPipe.js`)

**MediaPipe Face Detection:**
```javascript
faceMeshRef.current = new window.FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
});

faceMeshRef.current.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
```

**Face Landmarks Used:**
- Landmark 33 — Left eye (outer corner)
- Landmark 263 — Right eye (outer corner)
- Landmark 1 — Nose tip

**Glasses Overlay:**
```javascript
const leftEye = landmarks[33];
const rightEye = landmarks[263];
const ipd = Math.hypot(rx - lx, ry - ly);  // Inter-pupillary distance

const glassesWidth = ipd * 2.8 * currentScale;
const glassesHeight = (glassesWidth / 400) * 150;

// Draw glasses at eye position with rotation
ctx.save();
ctx.translate(centerX, centerY);
ctx.rotate(angle);
ctx.drawImage(img, -glassesWidth / 2, -glassesHeight / 2, glassesWidth, glassesHeight);
ctx.restore();
```

#### 2. State Management

**Auth Context:**
```javascript
const [user, setUser] = useState(() => {
  const stored = localStorage.getItem('vf_user');
  return stored ? JSON.parse(stored) : null;
});

// Actions
const requestOTP = useCallback(async (identifier) => { ... });
const verifyOTP = useCallback(async (identifier, otp) => { ... });
const logout = useCallback(() => {
  localStorage.removeItem('vf_user');
  localStorage.removeItem('vf_token');
  setUser(null);
});
```

**Cart Context (Zustand):**
```javascript
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      get totalItems() {
        return get().items.reduce((acc, i) => acc + i.quantity, 0);
      },
      
      addItem: (item) => set((state) => {
        // Check for existing entry, increment quantity or add new
      }),
      
      removeItem: (productId, lensType) => set((state) => ({
        items: state.items.filter(i => !(i.productId === productId && i.lensType === lensType))
      })),
    }),
    { name: 'visionframe-cart' }  // localStorage persistence
  )
);
```

#### 3. API Client (`useAPI.js`)

```javascript
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vf_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vf_token');
      localStorage.removeItem('vf_user');
    }
    return Promise.reject(error);
  }
);
```

#### 4. Product Grid (`ProductGrid.jsx`)

**Filter Implementation:**
```javascript
useEffect(() => {
  const params = {};
  if (searchParams.get("category")) params.category = searchParams.get("category");
  if (searchParams.get("shape")) params.shape = searchParams.get("shape");
  
  api.get("/products", { params })
    .then(({ data }) => setProducts(data.products || []))
    .catch((err) => console.error("Failed to load products:", err))
    .finally(() => setLoading(false));
}, [searchParams]);
```

**Lazy Loading:**
```javascript
const Home = lazy(() => import('./pages/Home'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
```

---

## Database Schema

### Tables

#### 1. users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  identifier TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_identifier ON users(identifier);
```

#### 2. products
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  title TEXT NOT NULL,
  category TEXT NOT NULL,           -- Eyeglasses | Sunglasses | Lenses
  collection_tag TEXT,              -- trending | new_arrival | premium
  frame_shape TEXT,                 -- Round | Rectangle | Cat-Eye | Aviator
  price REAL NOT NULL,
  stock_count INTEGER DEFAULT 0,
  ar_asset_url TEXT                 -- GLTF/GLB URL
);
```

#### 3. promo_codes
```sql
CREATE TABLE promo_codes (
  code TEXT PRIMARY KEY,
  discount_percentage REAL NOT NULL,
  max_discount_amount REAL NOT NULL,
  is_active BOOLEAN DEFAULT 1
);
```

#### 4. orders
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  user_id TEXT NOT NULL REFERENCES users(id),
  total_amount REAL NOT NULL,
  discount_applied REAL DEFAULT 0.0,
  promo_code TEXT REFERENCES promo_codes(code),
  payment_status TEXT DEFAULT 'pending',  -- pending | paid | failed | refunded
  payment_method TEXT,                    -- upi | card | netbanking | cod
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
```

#### 5. ar_telemetry
```sql
CREATE TABLE ar_telemetry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT REFERENCES users(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  event_type TEXT NOT NULL,
  dwell_time_seconds INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX idx_ar_telemetry_user_id ON ar_telemetry(user_id);
CREATE INDEX idx_ar_telemetry_product_id ON ar_telemetry(product_id);
```

### Sample Data

**Products:**
- Total: 1,010 items
- Eyeglasses: 348 items
- Sunglasses: 616 items
- Lenses: 46 items

**Categories:**
- Fashion Nova, Edikted, Zenni, H&M, Oak and Fort, etc.

**Frame Shapes:**
- Round, Rectangle, Cat-Eye, Aviator, Geometric, Square, etc.

---

## API Reference

### Authentication

#### POST /api/auth/otp
```json
// Request
{
  "identifier": "9876543210"  // Mobile number or email
}

// Response
{
  "message": "OTP sent to 9876543210",
  "mock_otp": "123456"  // Dev only!
}
```

#### POST /api/auth/verify
```json
// Request
{
  "identifier": "9876543210",
  "otp": "123456"
}

// Response
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "user_id": "user-uuid-here"
}
```

### Products

#### GET /api/products
```json
// Query params: category, shape, collection_type, skip, limit

// Response
{
  "total": 1010,
  "products": [
    {
      "id": "pKIJksZ",
      "title": "Blue Light Glasses",
      "category": "Eyeglasses",
      "collection_tag": "Fashion Nova",
      "frame_shape": "Square",
      "price": 174.24,
      "stock_count": 100,
      "ar_asset_url": "https://cdn.trychannel3.com/..."
    }
  ]
}
```

#### GET /api/products/{id}
```json
// Response (single product)
{
  "id": "pKIJksZ",
  "title": "Blue Light Glasses",
  "category": "Eyeglasses",
  "collection_tag": "Fashion Nova",
  "frame_shape": "Square",
  "price": 174.24,
  "stock_count": 100,
  "ar_asset_url": "https://cdn.trychannel3.com/..."
}
```

### Cart

#### POST /api/cart/add
```json
// Request
{
  "user_id": "user-uuid",
  "product_id": "pKIJksZ",
  "lens_type": "zero_power",
  "quantity": 1
}

// Response
{
  "success": true,
  "message": "Item added to cart.",
  "cart_item_count": 1
}
```

#### GET /api/cart/{user_id}
```json
// Response
{
  "user_id": "user-uuid",
  "items": [
    {
      "product_id": "pKIJksZ",
      "lens_type": "zero_power",
      "quantity": 1
    }
  ],
  "item_count": 1
}
```

#### DELETE /api/cart/remove
```json
// Query params: user_id, product_id, lens_type

// Response
{
  "success": true,
  "item_count": 0
}
```

### Promo Codes

#### POST /api/promos/validate
```json
// Request
{
  "code": "SAVE20",
  "cart_amount": 500.00
}

// Response
{
  "valid": true,
  "discount_amount": 100.00,
  "final_amount": 400.00,
  "message": "Promo 'SAVE20' applied! You save ₹100.00."
}
```

### Payment (Mock)

#### POST /api/payment/create-order
```json
// Request
{
  "user_id": "user-uuid",
  "cart_amount": 500.00,
  "promo_code": "SAVE20",
  "payment_method": "upi"
}

// Response
{
  "order_id": "ORD-ABC12",
  "razorpay_order_id": "order_mock123",
  "amount": 400.00,
  "currency": "INR",
  "status": "created"
}
```

#### POST /api/payment/verify
```json
// Request
{
  "order_id": "ORD-ABC12",
  "razorpay_payment_id": "pay_mock123",
  "razorpay_signature": "sig_mock123"
}

// Response
{
  "success": true,
  "order_id": "ORD-ABC12",
  "payment_status": "paid",
  "message": "Payment verified successfully. Order confirmed!"
}
```

### Telemetry

#### WebSocket: /api/telemetry/ws/{user_id}
```json
// Client → Server
{
  "product_id": "pKIJksZ",
  "event_type": "try_on_start",
  "dwell_time_seconds": 0
}

// Server → Client (ACK)
{
  "status": "received",
  "event": "try_on_start",
  "timestamp": "2026-08-31T10:30:45.123456+00:00"
}
```

#### POST /api/telemetry/
```json
// Request
{
  "user_id": "user-uuid",
  "product_id": "pKIJksZ",
  "event_type": "try_on_end",
  "dwell_time_seconds": 45
}

// Response
{
  "recorded": true,
  "event_id": 12345,
  "streamed_to_powerbi": true
}
```

---

## Deployment Architecture

### Current Deployment

| Component | Platform | URL |
|-----------|----------|-----|
| **Frontend** | Vercel | https://visionframe-app.vercel.app |
| **Backend** | Railway | https://saasvf-production.up.railway.app |
| **Database** | SQLite (Railway) | - |

### Railway Configuration

**Procfile:**
```
web: cd backend && python -m uvicorn app.main:app
```

**Root Directory:** `backend`

**Start Command:** `python -m uvicorn app.main:app`

**Environment Variables:**
- `CORS_ORIGINS=https://visionframe-app.vercel.app`
- `PYTHONUNBUFFERED=1`
- `DATABASE_URL=sqlite:///tmp/visionframe.db`

### Vercel Configuration

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

**Root Directory:** `frontend`

**Framework Preset:** Vite

**Environment Variables:**
- `VITE_API_URL=https://saasvf-production.up.railway.app/api`
- `PYTHONUNBUFFERED=1`

### Auto-Deployment Flow

```
Local Development
      ↓
git add .
git commit -m "feat: update something"
git push origin main
      ↓
GitHub receives commit
      ↓
GitHub Actions trigger (CI/CD)
      ↓
Backend linting & testing
Frontend build & lint
Security checks
      ↓
Vercel auto-deploys (if configured)
      ↓
Live at: https://visionframe-app.vercel.app
```

---

## Status Checklist

### ✅ Completed Features

#### Backend
- [x] FastAPI application with CORS
- [x] SQLite database with 5 tables
- [x] 1,010 products seeded from CSV
- [x] User authentication (OTP-based)
- [x] Product CRUD with filtering
- [x] Shopping cart (in-memory)
- [x] Promo code validation
- [x] Payment processing (mock Razorpay)
- [x] WebSocket telemetry
- [x] HTTP POST telemetry fallback
- [x] Rolling CSV buffer (100 records)
- [x] PowerBI integration (optional)
- [x] Health check endpoint
- [x] Railway deployment ready
- [x] Auto-seed on startup

#### Frontend
- [x] React 18 with Vite
- [x] Luxury UI theme (gold/purple/charcoal)
- [x] Responsive navigation bar
- [x] Hero carousel (3 slides)
- [x] Product grid with filters
- [x] Product detail page
- [x] AR try-on with MediaPipe
- [x] Face detection and tracking
- [x] SVG glasses overlay
- [x] Scale adjustment slider
- [x] Dwell time tracking
- [x] Shopping cart drawer
- [x] Checkout flow
- [x] Promo code application
- [x] Payment methods selection
- [x] OTP authentication modal
- [x] JWT token storage
- [x] Zustand cart state
- [x] Lazy loading pages
- [x] Error handling
- [x] Loading states
- [x] Vercel deployment ready

#### Telemetry
- [x] WebSocket endpoint
- [x] HTTP POST fallback
- [x] Event types: try_on_start, try_on_update, try_on_end
- [x] Dwell time tracking
- [x] SQLite storage
- [x] Rolling CSV buffer
- [x] PowerBI Push Dataset (optional)
- [x] Test script (`test_telemetry.py`)

#### Deployment
- [x] Railway backend configured
- [x] Vercel frontend configured
- [x] CORS configured for production
- [x] Environment variables set
- [x] GitHub Actions workflows
- [x] Git hooks configured
- [x] Documentation complete

### ❌ Remaining Features

#### Backend
- [ ] Redis for OTP storage (currently in-memory)
- [ ] Redis for cart storage (currently in-memory)
- [ ] PostgreSQL/MongoDB instead of SQLite
- [ ] Real Razorpay payment integration
- [ ] Real SMS OTP service (Twilio/AWS SNS)
- [ ] Email notifications
- [ ] Order history page (backend API)
- [ ] User profile management
- [ ] Address book
- [ ] Order tracking system
- [ ] Product reviews and ratings
- [ ] Wishlist feature
- [ ] Product search (currently only filters)
- [ ] Pagination on product list
- [ ] Image upload for products
- [ ] Discount management dashboard
- [ ] Order management dashboard

#### Frontend
- [ ] Wishlist component
- [ ] Review and rating system
- [ ] User profile page
- [ ] Order history page
- [ ] Address book management
- [ ] Product search functionality
- [ ] Infinite scroll for products
- [ ] Image zoom on product detail
- [ ] Multiple product images gallery
- [ ] Comparison feature (compare 2-3 products)
- [ ] Social sharing
- [ ] Email subscription
- [ ] Newsletter sign-up
- [ ] Coupon code banner
- [ ] Flash sale section
- [ ] trending products carousel
- [ ] Recently viewed products
- [ ] "Customers also bought" suggestions
- [ ] Size guide
- [ ] Frame measurement guide
- [ ] AR screenshot capture
- [ ] Share AR try-on result

#### Telemetry
- [ ] PowerBI Push Dataset real integration
- [ ] User session recording
- [ ] Heatmap analytics
- [ ] Conversion funnel analysis
- [ ] A/B testing support
- [ ] Real-time dashboard

#### Infrastructure
- [ ] Docker containers
- [ ] Kubernetes deployment
- [ ] CDN for static assets
- [ ] Rate limiting
- [ ] API authentication tokens
- [ ] Monitoring and logging
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Database backups
- [ ] CI/CD pipeline (GitHub Actions fully configured, needs testing)
- [ ] Preview deployments for PRs

---

## Future Enhancements

### Phase 1: Production Readiness (1-2 weeks)

#### Authentication & Security
1. **Redis integration** for OTP storage (multi-server safe)
2. **Real JWT secret** from environment variable
3. **Password reset** flow
4. **Session management** with refresh tokens
5. **API rate limiting** (express-rate-limit or similar)

#### Payment
1. **Razorpay integration** - actual payment processing
2. **Payment retry logic** with exponential backoff
3. **Invoice generation** (PDF)
4. **Refund processing**

#### Database
1. **Migrate to PostgreSQL** for production
2. **Database connection pooling**
3. **Backup automation**
4. **Data migration scripts**

### Phase 2: User Experience (2-3 weeks)

#### Product Features
1. **Product search** with autocomplete
2. **Filter improvements** - price range, brand, collection
3. **Sort options** - price (low-high, high-low), new arrivals, popularity
4. **Product comparison** (2-3 products side-by-side)
5. **Multiple product images** with gallery
6. **360° product view** (if AR asset supports)
7. **Video demonstrations** of products
8. **Customer reviews and ratings**

#### User Features
1. **User profile page** with edit capability
2. **Order history** with reorder option
3. **Wishlist** with share functionality
4. **Recently viewed** products
5. **Address book** with save defaults
6. **Multiple delivery addresses**
7. **Order tracking** with status updates
8. **Email notifications** for orders

#### AR Enhancements
1. **AR screenshot capture** and download
2. **AR video recording** (10-15 seconds)
3. **Multiple frame preview** (switch frames in AR)
4. **Lens type selection** in AR view
5. **Virtual mirror** (switch left/right eye view)
6. **AR try-on sharing** to social media

### Phase 3: Analytics & Insights (1-2 weeks)

#### Telemetry
1. **PowerBI Push Dataset** real integration
2. **Real-time dashboard** for admin
3. **Customer journey analytics**
4. **Conversion funnel analysis**
5. **Product performance metrics**
6. **AR try-on conversion rate**

#### Business Insights
1. **Top selling products** dashboard
2. **Revenue reports** (daily, weekly, monthly)
3. **Customer segmentation**
4. **Seasonal trends** analysis
5. **Inventory optimization** suggestions

### Phase 4: Advanced Features (2-4 weeks)

#### E-commerce
1. **Coupon code banner** on homepage
2. **Flash sale** functionality
3. **Bundle offers** (buy 2 get 1 free)
4. **Gift cards** purchase and redemption
5. **Subscription model** (monthly eyewear)
6. **Loyalty points** system

#### Marketing
1. **Email subscription** pop-up
2. **Newsletter** integration
3. **Push notifications**
4. **Abandoned cart** recovery emails
5. **Product recommendations** (ML-based)
6. **Social proof** (recent purchases)

#### Technical
1. **Progressive Web App** (PWA) support
2. **Service workers** for offline capability
3. **Image optimization** (WebP, lazy loading)
4. **Code splitting** improvements
5. **SEO optimization** (meta tags, sitemap)
6. **Accessibility** (WCAG 2.1 AA compliance)

### Phase 5: Infrastructure (2-3 weeks)

#### DevOps
1. **Docker containers** for all services
2. **Kubernetes** deployment (optional)
3. **CI/CD pipeline** with automated testing
4. **Preview deployments** for PRs
5. **Staging environment**
6. **Database migrations** with Alembic

#### Monitoring
1. **Error tracking** (Sentry)
2. **Performance monitoring** (New Relic, DataDog)
3. **Log aggregation** (ELK stack)
4. **Alerting** for critical issues
5. **Health check endpoints** for all services

#### Security
1. **HTTPS enforcement**
2. **Security headers** (Helmet.js)
3. **CORS policy** refinement
4. **SQL injection** prevention
5. **XSS protection**
6. **CSRF protection**

---

## Quick Reference

### Development Commands

**Backend:**
```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Test Telemetry:**
```bash
cd backend
python test_telemetry.py
```

**Seed Products:**
```bash
cd backend
python seed_products.py
```

### Important URLs

- **Local Backend:** http://localhost:8000
- **Local Frontend:** http://localhost:5173
- **Production Backend:** https://saasvf-production.up.railway.app
- **Production Frontend:** https://visionframe-app.vercel.app
- **API Docs:** https://saasvf-production.up.railway.app/docs

### File Locations

**Backend Code:** `backend/app/`
**Frontend Code:** `frontend/src/`
**Database:** `backend/data/visionframe.db`
**Products CSV:** `backend/data/seed_data.csv`
**Telemetry CSV:** `backend/telemetry_stream.csv`

### Environment Variables

**Backend (.env):**
- `CORS_ORIGINS` - Allowed frontend domains
- `PYTHONUNBUFFERED=1` - Python logging
- `DATABASE_URL=sqlite:///./data/visionframe.db` - Database path

**Frontend (.env.local):**
- `VITE_API_URL` - Backend API base URL
- `PYTHONUNBUFFERED=1` - (ignored by frontend)

---

## Support & Resources

### Documentation Files
- `WALKTHROUGH.md` - Getting started guide
- `TECHNICAL_DOCUMENTATION.md` - This file
- `TELEMETRY.md` - Telemetry details
- `GITHUB_WORKFLOW.md` - Git workflows
- `GIT_WORKFLOW.md` - Git hooks guide

### Community Resources
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh)

### Contact
For issues or questions, refer to the main `README.md` or check the console logs.

---

**Version:** 1.0  
**Last Updated:** August 31, 2026  
**Status:** ✅ Production Ready (Basic Features)  
**Project:** VisionFrame College SaaS Demo  
**Repository:** https://github.com/vismaya2802/SaaS
