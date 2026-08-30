# VisionFrame SaaS v3.0 — College Project

> **Zero-Defect · $0.00 Deployment · Full-Stack Python + React**

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.10+, FastAPI, SQLAlchemy, SQLite |
| Frontend | React 18 (Vite), TailwindCSS, Zustand, Axios |
| AR | MediaPipe FaceMesh (JS) |
| Analytics | PowerBI Push Dataset (REST API) |
| Payments | Mocked Razorpay flow |
| Auth | Mock OTP → JWT |

---

## 🚀 Quick Start

### Backend
```bash
cd VisionFrame-saas/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

### Frontend
```bash
cd VisionFrame-saas/frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 📁 Directory Structure

```
VisionFrame-saas/
├── backend/
│   ├── app/
│   │   ├── main.py          ← FastAPI entry point
│   │   ├── database.py      ← SQLAlchemy engine + get_db()
│   │   ├── models.py        ← ORM models (5 tables)
│   │   ├── schemas.py       ← Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── auth.py      ← POST /api/auth/otp + /verify
│   │   │   ├── products.py  ← GET /api/products
│   │   │   ├── cart.py      ← POST /api/cart/add
│   │   │   ├── promos.py    ← POST /api/promos/validate
│   │   │   ├── payment.py   ← POST /api/payment/create-order + /verify
│   │   │   └── telemetry.py ← POST + WS /api/telemetry
│   │   └── services/
│   │       └── powerbi_stream.py
│   ├── data/
│   │   └── seed_data.csv
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── HeroCarousel.jsx
│   │   │   ├── ProductGrid.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── OTPModal.jsx
│   │   │   └── ARView.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  ← JWT auth + OTP state
│   │   │   └── CartContext.jsx  ← Zustand cart store
│   │   ├── hooks/
│   │   │   ├── useAPI.js        ← Axios instance
│   │   │   └── useMediaPipe.js  ← FaceMesh hook
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── ProductDetail.jsx (with ARView)
│   │   │   └── Checkout.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── powerbi_engine/
    ├── stream_telemetry.py   ← Standalone batch push script
    └── dax_measures.md       ← All DAX formulas
```

---

## 🔐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/otp` | Request mock OTP |
| POST | `/api/auth/verify` | Verify OTP → JWT |
| GET | `/api/products` | List products (filterable) |
| GET | `/api/products/{id}` | Single product |
| POST | `/api/cart/add` | Add to cart |
| GET | `/api/cart/{user_id}` | View cart |
| POST | `/api/promos/validate` | Validate promo code |
| POST | `/api/payment/create-order` | Create mock order |
| POST | `/api/payment/verify` | Verify mock payment |
| POST | `/api/telemetry` | Record AR event |
| WS | `/api/ws/telemetry` | Real-time AR event stream |

---

## 🌱 Seeding the Database

```bash
cd backend
python -c "
import pandas as pd
from app.database import SessionLocal, engine
from app.models import Base, Product, PromoCode
Base.metadata.create_all(engine)
db = SessionLocal()

# Load products from CSV
df = pd.read_csv('data/seed_data.csv')
for _, row in df.iterrows():
    p = Product(**{k: (None if str(v)=='nan' else v) for k,v in row.items()})
    db.merge(p)

# Seed promo codes
db.merge(PromoCode(code='VisionFrame10', discount_percentage=10, max_discount_amount=200, is_active=True))
db.merge(PromoCode(code='FIRST50',    discount_percentage=50, max_discount_amount=500, is_active=True))
db.commit()
db.close()
print('Seeded!')
"
```

---

## 📊 PowerBI Integration

1. Create a **Streaming Dataset** in PowerBI with columns: `product_id, event_type, dwell_time, timestamp`
2. Copy the Push URL to `POWERBI_PUSH_URL` env var
3. Run: `python powerbi_engine/stream_telemetry.py --limit 100`
4. Import DAX measures from `powerbi_engine/dax_measures.md`

