# 🚨 VERCEL DEPLOYMENT FIX - Frontend Only

## Current Error: 404 NOT_FOUND

**Problem:** Vercel is trying to deploy the entire monorepo instead of just the frontend.

## ✅ SOLUTION: Configure Vercel for Frontend Only

### Option 1: Update via Vercel Dashboard (EASIEST)

1. Go to: https://vercel.com/dashboard
2. Click on **visionframe-app** project
3. Go to **Settings** → **General**
4. Update these settings:

   **Root Directory:**
   `
   frontend
   `
   ✓ Include source files outside of the Root Directory in the Build Step

   **Framework Preset:**
   `
   Vite
   `

   **Build Command:**
   `
   npm run build
   `

   **Output Directory:**
   `
   dist
   `

   **Install Command:**
   `
   npm install
   `

5. Go to **Environment Variables** and add:
   `
   Name: VITE_API_URL
   Value: https://your-railway-app.up.railway.app/api
   Environments: Production, Preview, Development (all checked)
   `

6. Go to **Deployments** tab
7. Click **⋯** on latest deployment → **Redeploy**

---

### Option 2: Delete and Re-import (CLEAN START)

1. Go to Vercel Dashboard
2. Click **visionframe-app** → Settings → scroll to bottom
3. Click **Delete Project** (don't worry, code is safe in GitHub)
4. Go back to Dashboard → **Add New** → **Project**
5. Import your GitHub repository
6. **IMPORTANT:** Set **Root Directory** to: rontend
7. Framework will auto-detect as **Vite**
8. Add Environment Variable:
   - VITE_API_URL = https://your-railway-app.up.railway.app/api
9. Click **Deploy**

---

### Option 3: Use Vercel CLI (ADVANCED)

`powershell
# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy frontend only
vercel --prod

# Follow prompts:
# - Link to existing project? Yes
# - Select visionframe-app
`

---

## 🔧 Updated vercel.json (Already Fixed)

The vercel.json in root now correctly points to frontend:

`json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install"
}
`

---

## ✅ What Should Happen After Fix

1. ✅ Vercel builds only the frontend (React + Vite)
2. ✅ Homepage loads at: https://visionframe-app.vercel.app
3. ✅ API calls go to Railway backend
4. ✅ No 404 errors

---

## 🎯 Quick Fix Steps

1. **Update Root Directory to rontend in Vercel Dashboard**
2. **Add VITE_API_URL environment variable** (Railway URL)
3. **Redeploy**

That's it! Your frontend will be live in 2 minutes.

---

## 📋 Backend Reminder

Don't forget to deploy backend to Railway:
- Start command: cd backend && python -m uvicorn app.main:app
- Add CORS_ORIGINS with your Vercel URL
- Get Railway URL and use it as VITE_API_URL in Vercel

---

**Status:**
✅ vercel.json updated
✅ Configuration ready
⚠️ Needs Vercel dashboard update (Root Directory = frontend)
