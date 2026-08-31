# ✅ Monorepo Configuration Verification

Complete verification and testing of your monorepo deployment setup.

---

## 📋 Pre-Deployment Checklist

### ✅ File Structure Verified

```
lenskart-saas/
├── ✅ vercel.json                 (Main config file)
├── ✅ frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── ✅ backend/
│   ├── requirements.txt
│   ├── app/main.py
│   └── app/
└── ...
```

### ✅ Configuration Files Verified

**vercel.json:**
- ✅ Version: 3
- ✅ Services: frontend + backend defined
- ✅ Framework: vite for frontend
- ✅ Runtime: python@3.11 for backend
- ✅ Rewrites: /api/* → backend, /* → frontend
- ✅ Environment variables configured

**backend/requirements.txt:**
- ✅ Contains: fastapi, uvicorn, sqlalchemy, pydantic, etc.
- ✅ All dependencies present

**backend/app/main.py:**
- ✅ CORS enabled for production URLs
- ✅ All routers included
- ✅ Health check endpoint available

---

## 🧪 Local Testing

### Test 1: Backend Starts Locally

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
[OK] Database tables created / verified.
```

**✅ Test passes if:**
- Server starts without errors
- Health endpoint works: `http://127.0.0.1:8000/health`
- API endpoints respond: `http://127.0.0.1:8000/api/products`

---

### Test 2: Frontend Starts Locally

```powershell
cd frontend
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

**✅ Test passes if:**
- Dev server starts without errors
- App loads in browser
- No console errors in DevTools

---

### Test 3: Frontend Calls Backend API

**In browser console (F12):**
```javascript
// Test 1: Health check
fetch('http://127.0.0.1:8000/api/health')
  .then(r => r.json())
  .then(console.log)
// Should log: {status: "ok", service: "visionframe-backend", ...}

// Test 2: Get products
fetch('http://127.0.0.1:8000/api/products?limit=1')
  .then(r => r.json())
  .then(console.log)
// Should log: {total: 1010, products: [...]}
```

**✅ Test passes if:**
- API responds with JSON
- No CORS errors
- Data returned correctly

---

## 📦 Production Readiness Checklist

### Backend Configuration ✅

- [x] Uses `host="0.0.0.0"` (accepts all interfaces)
- [x] Uses dynamic `PORT` from environment: `$PORT`
- [x] CORS allows production domains
- [x] All required dependencies in `requirements.txt`
- [x] SQLite database auto-creates on startup
- [x] Health check endpoint available

**Check CORS in backend/app/main.py:**
```python
allow_origins=[
    "http://localhost:5173",        # Dev
    "https://saasvf.vercel.app",    # Production
    "https://*.vercel.app",         # Preview deployments
]
```

### Frontend Configuration ✅

- [x] Uses Vite build system
- [x] Environment variable: `VITE_API_URL`
- [x] API calls don't hardcode URLs
- [x] Build produces `dist/` folder

**Check frontend/vite.config.js or frontend/src:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || ''
// Correct usage
fetch(`${API_URL}/api/products`)
```

### Vercel Configuration ✅

- [x] `vercel.json` in repository root
- [x] Services properly defined
- [x] Build commands correct
- [x] Rewrites properly configured
- [x] Environment variables referenced

---

## 🔍 Configuration Validation

### Verify vercel.json Structure

```json
{
  "version": 3,                    // ✅ Latest version
  
  "services": {
    "frontend": {
      "root": "frontend",          // ✅ Correct path
      "framework": "vite",         // ✅ Vite framework
      "build": {
        "command": "npm run build",
        "outputs": ["dist"]        // ✅ Output folder
      }
    },
    "backend": {
      "root": "backend",           // ✅ Correct path
      "runtime": "python@3.11",    // ✅ Python 3.11
      "build": {
        "command": "pip install -r requirements.txt"
      },
      "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
      // ✅ Dynamic port from environment
    }
  },
  
  "rewrites": [                    // ✅ Routing rules
    {
      "source": "/api(/.*)?",      // ✅ API routes
      "destination": {
        "service": "backend"       // ✅ Routes to backend
      }
    },
    {
      "source": "/(.*)",           // ✅ Catch-all
      "destination": {
        "service": "frontend"      // ✅ Routes to frontend
      }
    }
  ]
}
```

---

## 🚀 Deployment Verification Steps

### Step 1: Push to GitHub

```powershell
git add .
git commit -m "fix(cors): add production domains to vercel config"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to: https://vercel.com/new
2. Import: `vismaya2802/saasvf`
3. Project name: `saasvf`
4. Framework: "Other"
5. Root: `.`

### Step 3: Set Environment Variables

In Vercel → Settings → Environment Variables:

```
VITE_API_URL = https://saasvf.vercel.app/api
PYTHONUNBUFFERED = 1
```

### Step 4: Deploy

Click "Deploy" button

**Wait 5-10 minutes for both services to build**

---

## ✨ Post-Deployment Verification

### Test 1: Frontend Loads

```
https://saasvf.vercel.app
```

**Check:**
- Page loads without errors
- React app displays correctly
- No console errors (F12)

### Test 2: Backend Health Check

```
https://saasvf.vercel.app/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "service": "visionframe-backend",
  "version": "3.0.0"
}
```

### Test 3: API Functionality

```
https://saasvf.vercel.app/api/products?limit=1
```

**Expected response:**
```json
{
  "total": 1010,
  "products": [
    {
      "id": "...",
      "title": "...",
      "category": "...",
      ...
    }
  ]
}
```

### Test 4: Frontend → Backend Communication

**In browser console:**
```javascript
fetch('https://saasvf.vercel.app/api/products?limit=1')
  .then(r => r.json())
  .then(d => console.log('✅ API works!', d))
  .catch(e => console.error('❌ Error:', e))
```

**Should see:** ✅ API works! (with products data)

---

## 📊 Deployment Verification Checklist

### Before Deployment
- [ ] vercel.json exists in root
- [ ] Backend uses dynamic PORT
- [ ] CORS includes production URL
- [ ] All dependencies in requirements.txt
- [ ] Frontend uses import.meta.env.VITE_API_URL
- [ ] No hardcoded URLs in API calls
- [ ] Code pushed to GitHub

### During Deployment
- [ ] Vercel starts building
- [ ] Frontend build succeeds
- [ ] Backend build succeeds
- [ ] Environment variables set
- [ ] Deployment completes (green checkmark)

### After Deployment
- [ ] https://saasvf.vercel.app loads
- [ ] https://saasvf.vercel.app/api/health responds
- [ ] https://saasvf.vercel.app/api/products works
- [ ] Frontend can call backend API
- [ ] No CORS errors in console
- [ ] Database accessible from backend

---

## 🔧 Troubleshooting

### "Build failed - vercel.json not found"

**Check:**
- vercel.json is in repository **root** (not in frontend/ or backend/)
- File is committed and pushed to GitHub

**Fix:**
```powershell
# Verify file exists
Test-Path vercel.json

# Make sure it's in git
git status vercel.json
```

### "Backend service failed to start"

**Check Vercel logs:**
1. Go to Vercel dashboard → Deployments
2. Click failed deployment
3. View backend build logs

**Common causes:**
- Missing dependencies: Add to requirements.txt
- Wrong Python syntax: Test locally first
- PORT not dynamic: Use `os.environ.get("PORT", 8000)`

**Fix:**
```python
import os
port = int(os.environ.get("PORT", 8000))
uvicorn.run(app, host="0.0.0.0", port=port)
```

### "Frontend can't reach backend API"

**Check:**
1. VITE_API_URL environment variable set in Vercel
2. Frontend uses: `import.meta.env.VITE_API_URL`
3. CORS allows the frontend domain

**Fix CORS in backend/app/main.py:**
```python
allow_origins=[
    "https://saasvf.vercel.app",
    "https://*.vercel.app",
]
```

### "CORS error in browser"

**In browser console:**
```javascript
// This will fail with CORS error if not configured
fetch('https://saasvf.vercel.app/api/products')
  .catch(e => console.log('CORS:', e))
```

**Fix:**
- Check CORS middleware in backend
- Ensure production domain is in allow_origins
- Verify vercel.json routing is correct

---

## 📈 Monitoring After Deployment

### Real-time Monitoring

**Vercel Dashboard:**
- https://vercel.com/dashboard/saasvf
- Click "Deployments" to see build logs
- Click "Function" for live backend logs
- Check "Error Reporting" for issues

**GitHub Actions:**
- https://github.com/vismaya2802/saasvf/actions
- View deployment workflow runs
- Check for build or test failures

### Performance Metrics

**Vercel Analytics:**
- Deployment time
- Build size
- Response times
- Error rates

---

## ✅ Success Criteria

Your deployment is **successful** when:

✅ Frontend loads at https://saasvf.vercel.app  
✅ Backend responds at https://saasvf.vercel.app/api/health  
✅ Frontend successfully calls backend API  
✅ No errors in browser console  
✅ Database operations work  
✅ Auto-deployment works on next push  

---

## 🎉 Deployment Complete!

Once all tests pass:

✅ **Your monorepo is deployed** - Both frontend and backend live  
✅ **Single Vercel project** - Everything in one place  
✅ **Auto-deployment enabled** - Push → automatic deploy  
✅ **Full-stack SaaS running** - Production ready  

**Your live app:** https://saasvf.vercel.app 🚀

---

**Version:** 1.0  
**Status:** Verified ✅  
**Last Updated:** August 31, 2026

