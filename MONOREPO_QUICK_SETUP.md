# ⚡ Monorepo Quick Setup (10 Minutes)

Fast-track full-stack deployment to Vercel.

---

## 🎯 What You're Doing

Deploying **both** frontend and backend in **one** Vercel project.

```
Frontend (React)  ──┐
                    ├──→ One Vercel Project
Backend (FastAPI) ─┘
```

---

## 📋 Prerequisites

- ✅ GitHub repo: https://github.com/vismaya2802/saasvf
- ✅ vercel.json created (provided below)
- ✅ Vercel account ready
- ✅ Both frontend and backend ready

---

## 5-Minute Setup

### Step 1: Add vercel.json to Root

**File:** `vercel.json` (in repository root)

```json
{
  "version": 3,
  "env": {
    "VITE_API_URL": "@vite_api_url",
    "PYTHONUNBUFFERED": "1"
  },
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

**Where to put it:**
```
lenskart-saas/
├── vercel.json          ← HERE (root level)
├── frontend/
├── backend/
└── ...
```

### Step 2: Commit & Push

```powershell
cd lenskart-saas
git add vercel.json
git commit -m "config: add vercel.json for monorepo"
git push origin main
```

### Step 3: Deploy on Vercel

1. Go to: https://vercel.com/new
2. Import repo: `vismaya2802/saasvf`
3. Project name: `saasvf` (must be lowercase)
4. Framework: Leave as "Other" (let vercel.json handle it)
5. Root directory: `.` (keep default)

### Step 4: Add Environment Variables

In Vercel form, scroll to **Environment Variables**:

Add:
```
VITE_API_URL = https://saasvf.vercel.app/api
PYTHONUNBUFFERED = 1
```

### Step 5: Click Deploy

Wait 5-10 minutes...

Your app is LIVE at: **https://saasvf.vercel.app** 🎉

---

## ✅ Verify It Works

### Test 1: Frontend Loads
```
https://saasvf.vercel.app
# Should show React app
```

### Test 2: Backend Responds
```
https://saasvf.vercel.app/api/health
# Should show JSON response
```

### Test 3: API Works
```
https://saasvf.vercel.app/api/products?limit=1
# Should show products
```

---

## 🔄 How It Routes

```
User requests:        https://saasvf.vercel.app/
                      ↓
vercel.json routing:  Matches "/(.*)"
                      ↓
Routed to:            Frontend (React)
                      ↓
User sees:            React app


User requests:        https://saasvf.vercel.app/api/products
                      ↓
vercel.json routing:  Matches "/api(/.*)?""
                      ↓
Routed to:            Backend (FastAPI)
                      ↓
User sees:            JSON from API
```

---

## 📝 Key Files

### In Root:
```
vercel.json
```

### In Frontend:
```
frontend/package.json
frontend/vite.config.js
frontend/src/
```

### In Backend:
```
backend/requirements.txt
backend/app/main.py
backend/app/
```

---

## 🚨 Common Issues

### "vercel.json not found"
- Make sure it's in **root** of repo, not in frontend/ or backend/

### "Backend not starting"
- Check `app.main:app` uses `host="0.0.0.0"`
- Check `port = os.environ.get("PORT", 8000)`

### "Frontend can't call API"
- Check `VITE_API_URL` is set in Vercel env vars
- Check frontend uses: `import.meta.env.VITE_API_URL`

### "Build fails"
- Check all dependencies in `requirements.txt`
- Check `package.json` in frontend/
- View Vercel logs for exact error

---

## 🎯 After Deploy

✅ **Your live app:**  
https://saasvf.vercel.app

✅ **Auto-deployment:**  
Every `git push origin main` → auto-deploys

✅ **Both services together:**  
Frontend on Vercel  
Backend on Vercel  
Both same URL, different paths

---

## 📚 For More Details

Read: **MONOREPO_DEPLOYMENT.md** (complete guide)

---

**Status:** Ready to Deploy ✅  
**Time:** ~10 minutes to live

