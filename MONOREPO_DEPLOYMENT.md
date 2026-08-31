# 🚀 Full-Stack Monorepo Deployment to Vercel

Deploy your complete SaaS application (Frontend + Backend) to Vercel using monorepo configuration.

---

## 📋 What is This?

Your application has a **monorepo structure**:

```
lenskart-saas/
├── frontend/          ← React + Vite (Port 3000)
├── backend/           ← FastAPI + Python (Port 8000)
├── vercel.json        ← Configuration for both
└── ... other files
```

This guide deploys **BOTH** together on one Vercel project.

---

## 🎯 What You Get

✅ **Single Vercel Project** - Both frontend and backend in one place  
✅ **Automatic Routing** - `/api` routes → Backend | Other routes → Frontend  
✅ **Shared Environment** - Both services can access same variables  
✅ **Single Deployment** - One push → both deploy together  
✅ **Live URL** - https://saasvf.vercel.app (or your domain)

---

## 📦 Configuration: vercel.json

The `vercel.json` file controls how Vercel deploys your monorepo:

```json
{
  "services": {
    "frontend": {
      "root": "frontend",
      "framework": "vite",
      "build": {
        "command": "npm run build",
        "outputs": ["dist"]
      }
    },
    "backend": {
      "root": "backend",
      "runtime": "python@3.11",
      "build": {
        "command": "pip install -r requirements.txt"
      },
      "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
    }
  },
  "rewrites": [
    {
      "source": "/api(/.*)?",
      "destination": {
        "type": "service",
        "service": "backend"
      }
    },
    {
      "source": "/(.*)",
      "destination": {
        "type": "service",
        "service": "frontend"
      }
    }
  ]
}
```

### Configuration Breakdown:

**Frontend Service:**
- `root`: Points to `frontend/` folder
- `framework`: Uses `vite` for build optimization
- `build.command`: Runs `npm run build` to create `dist/`
- `build.outputs`: Vercel serves files from `dist/`

**Backend Service:**
- `root`: Points to `backend/` folder
- `runtime`: Uses Python 3.11
- `build.command`: Installs dependencies from `requirements.txt`
- `startCommand`: Starts FastAPI with Uvicorn on the assigned port

**Rewrites (Routing):**
- `/api/*` → Routes to backend service
- `/*` → Routes to frontend service

---

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

**1.1 Verify directory structure:**
```
lenskart-saas/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── ...
├── vercel.json          ← Make sure this exists!
└── ...
```

**1.2 Check vercel.json exists locally:**
```powershell
cd "c:\Users\Vismaya Nair\Downloads\Vismaya College Project\Vismaya College Project\lenskart-saas"
Test-Path vercel.json
# Should return: True
```

### Step 2: Update Environment Variables

**In Vercel Dashboard:**

1. Go to: https://vercel.com/dashboard/your-project/settings/environment-variables

2. Add these environment variables:

```
VITE_API_URL=https://saasvf.vercel.app/api
PYTHONUNBUFFERED=1
```

**Explanation:**
- `VITE_API_URL`: Frontend uses this to call backend API
- `PYTHONUNBUFFERED`: Python logs appear immediately (for debugging)

### Step 3: Configure Backend Service

Vercel might need hints about your Python backend:

**Create `backend/vercel.json`** (optional but recommended):

```json
{
  "buildCommand": "pip install -r requirements.txt",
  "runtime": "python@3.11"
}
```

Or you can set this in main `vercel.json` (already done above).

### Step 4: Test Locally

**1. Run frontend:**
```powershell
cd frontend
npm run dev
# Should run on http://localhost:5173
```

**2. Run backend (in new terminal):**
```powershell
cd backend
python -m uvicorn app.main:app --reload
# Should run on http://127.0.0.1:8000
```

**3. Test API calls:**
```powershell
# In frontend browser console:
fetch('http://127.0.0.1:8000/api/products')
  .then(r => r.json())
  .then(console.log)
```

### Step 5: Deploy to Vercel

**5.1 Push to GitHub:**
```powershell
git add vercel.json
git commit -m "config: add vercel.json for monorepo deployment"
git push origin main
```

**5.2 Go to Vercel:**
https://vercel.com/new

**5.3 Import your repository:**
- Repository: `vismaya2802/saasvf`
- Click "Import"

**5.4 Configure project:**
- **Project Name:** `saasvf` (lowercase, no special chars)
- **Framework:** Leave as "Other"
- **Root Directory:** `.` (root, since we have vercel.json)

**5.5 Environment Variables:**
Add these in Vercel dashboard:
```
VITE_API_URL=https://saasvf.vercel.app/api
PYTHONUNBUFFERED=1
```

**5.6 Deploy:**
Click "Deploy"

**Wait 5-10 minutes** for both services to build and deploy.

---

## 🔄 How Routing Works

When your app is deployed:

```
Request to: https://saasvf.vercel.app/products
├─ Matches: "/(.*)"
└─ Routes to: Frontend (React)
   └─ Frontend loads from dist/

Request to: https://saasvf.vercel.app/api/products
├─ Matches: "/api(/.*)?""
└─ Routes to: Backend (FastAPI)
   └─ Backend handles request from app.main:app
   └─ Returns JSON response
```

---

## 📡 Frontend to Backend Communication

### In Development:
```javascript
// frontend/src/hooks/useAPI.js
const API_URL = 'http://127.0.0.1:8000'  // Local backend

fetch(`${API_URL}/api/products`)
```

### In Production (Vercel):
```javascript
// frontend/src/hooks/useAPI.js
const API_URL = import.meta.env.VITE_API_URL || ''
// VITE_API_URL = 'https://saasvf.vercel.app/api'

fetch(`${API_URL}/products`)
// Calls: https://saasvf.vercel.app/api/products
// Which routes to backend via vercel.json
```

---

## ⚠️ Important Configuration Details

### vercel.json Key Points:

1. **Version**: `"version": 3` - Latest Vercel format

2. **Services**: Define frontend and backend separately
   - Each has its own `root`, `build`, and `runtime`

3. **Rewrites**: Control routing
   - `/api/*` → backend
   - `/*` → frontend (catch-all, must be last)

4. **Environment Variables**:
   ```json
   "env": {
     "VITE_API_URL": "@vite_api_url",
     "PYTHONUNBUFFERED": "1"
   }
   ```
   - `@vite_api_url` is a reference to Vercel environment variable

### Backend Requirements:

**`backend/requirements.txt` must include:**
```
fastapi>=0.111.0
uvicorn[standard]>=0.29.0
sqlalchemy>=2.0.30
pydantic>=2.7.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.9
pandas>=2.2.0
websockets>=12.0
httpx>=0.27.0
```

**`backend/app/main.py` must use dynamic port:**
```python
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

---

## 🧪 Testing the Deployment

### 1. After Deployment, Test Frontend:
```
https://saasvf.vercel.app
# Should load React app
```

### 2. Test API Endpoint:
```
https://saasvf.vercel.app/api/health
# Should return: {"status":"ok", "service":"visionframe-backend", ...}
```

### 3. Test Products API:
```
https://saasvf.vercel.app/api/products?limit=1
# Should return: {"total":1010, "products":[...]}
```

### 4. Monitor Logs:
- Go to Vercel Dashboard → Your Project → Deployments
- Click latest deployment
- View logs for frontend and backend

---

## 🔍 Troubleshooting Monorepo Deployment

### Error: "Cannot find vercel.json"

**Solution:** Ensure `vercel.json` is in the **root** of your repository
```
lenskart-saas/
├── vercel.json  ← Should be here, not in frontend/ or backend/
├── frontend/
└── backend/
```

### Error: "Backend service not starting"

**Check:**
1. `backend/requirements.txt` exists
2. `backend/app/main.py` uses `host="0.0.0.0"` and `port=os.environ.get("PORT", 8000)`
3. CORS is enabled in FastAPI

**Fix in `backend/app/main.py`:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (restrict in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Error: "Frontend fails to connect to API"

**Check:**
1. `VITE_API_URL` environment variable set in Vercel
2. Frontend code uses: `import.meta.env.VITE_API_URL`
3. API calls use correct path: `/api/products` (not full URL)

**Example fix:**
```javascript
// ✅ Correct
const url = `${import.meta.env.VITE_API_URL}/products`
fetch(url)

// ❌ Wrong
const url = `${import.meta.env.VITE_API_URL}api/products`
fetch(url)  // Double /api/api
```

### Error: "Build fails with Python error"

**Check:**
1. All dependencies in `requirements.txt`
2. No local imports breaking
3. Python 3.11 compatible code

**Test locally:**
```powershell
cd backend
python -m pip install -r requirements.txt
python -c "from app.main import app; print('OK')"
```

---

## 📊 Monorepo vs Separate Deployments

| Aspect | Monorepo (Vercel) | Separate |
|--------|-------------------|----------|
| **Services** | Frontend + Backend in 1 project | Frontend: Vercel, Backend: Another service |
| **Deployment** | Single `vercel.json` | Multiple configs |
| **Cost** | Lower (single project) | Higher (multiple services) |
| **Scaling** | Both scale together | Scale independently |
| **Complexity** | Simpler | More complex |
| **Routing** | Built-in via rewrites | Manual routing |

---

## 🚀 Auto-Deployment with Monorepo

GitHub Actions works the same way:

```yaml
# .github/workflows/vercel-deploy.yml

on:
  push:
    branches: [main]

jobs:
  Deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
```

**Both frontend and backend deploy automatically** when you push to main!

---

## 📈 Scaling Your Monorepo

### Current Setup:
```
Single Vercel Project
├── Frontend (Vite)
└── Backend (FastAPI)
```

### Future (If needed):
```
Option 1: Keep monorepo (recommended for small teams)

Option 2: Split into services
├── Frontend Vercel Project
├── Backend Heroku/Railway/AWS
└── Database PostgreSQL (separate)
```

---

## 🎯 Quick Reference

### Files to Commit:
- `vercel.json` - Configuration file
- `backend/requirements.txt` - Python dependencies
- `frontend/package.json` - Node dependencies
- `frontend/vite.config.js` - Vite configuration

### Environment Variables (Set in Vercel):
- `VITE_API_URL`: Base URL for API calls
- `PYTHONUNBUFFERED`: Python logging

### Deployment URL Pattern:
```
https://PROJECT_NAME.vercel.app
https://saasvf.vercel.app

API Endpoint:
https://saasvf.vercel.app/api/...

Frontend Routes:
https://saasvf.vercel.app/...
```

---

## ✅ Deployment Checklist

- [ ] `vercel.json` created in repo root
- [ ] `backend/requirements.txt` has all dependencies
- [ ] `backend/app/main.py` uses `host="0.0.0.0"` and dynamic port
- [ ] CORS enabled in FastAPI
- [ ] Frontend uses `import.meta.env.VITE_API_URL`
- [ ] API calls don't hardcode URLs
- [ ] Environment variables set in Vercel dashboard
- [ ] Repository pushed to GitHub
- [ ] Vercel project created
- [ ] Deployment successful
- [ ] Test frontend loads: https://saasvf.vercel.app
- [ ] Test API works: https://saasvf.vercel.app/api/products
- [ ] Auto-deployment enabled

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Your Project:** https://vercel.com/dashboard/saasvf
- **Deployed App:** https://saasvf.vercel.app
- **GitHub Repo:** https://github.com/vismaya2802/saasvf

---

## 🎉 Success!

Once deployed:
- ✅ App is live worldwide
- ✅ Frontend and backend working together
- ✅ Single deployment URL
- ✅ Auto-deploy on every push
- ✅ Automatic scaling

**Your monorepo is now in production!** 🚀

---

**Version:** 1.0  
**Last Updated:** August 31, 2026  
**Status:** Production Ready ✅

