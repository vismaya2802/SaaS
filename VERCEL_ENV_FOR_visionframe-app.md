# 🚀 COPY-PASTE READY: Environment Variables for visionframe-app

## ✅ Add These 4 Variables to Vercel Dashboard

**Go to:** https://vercel.com/dashboard → visionframe-app → Settings → Environment Variables

---

### 1️⃣ VITE_API_URL

**Key:** `VITE_API_URL`

**Value:** `https://visionframe-app.vercel.app/api`

**Environments:** Check all 3 boxes
- ✓ Production
- ✓ Preview  
- ✓ Development

---

### 2️⃣ PYTHONUNBUFFERED

**Key:** `PYTHONUNBUFFERED`

**Value:** `1`

**Environments:** Check all 3 boxes
- ✓ Production
- ✓ Preview  
- ✓ Development

---

### 3️⃣ CORS_ORIGINS

**Key:** `CORS_ORIGINS`

**Value:** `https://visionframe-app.vercel.app`

**Environments:** Check all 3 boxes
- ✓ Production
- ✓ Preview  
- ✓ Development

---

### 4️⃣ DATABASE_URL

**Key:** `DATABASE_URL`

**Value:** `sqlite:///tmp/visionframe.db`

**Environments:** Check all 3 boxes
- ✓ Production
- ✓ Preview  
- ✓ Development

⚠️ **Important:** SQLite on Vercel has limitations. For production use:
- **Vercel Postgres** (recommended) - Create in Storage tab
- **Supabase** - Free tier available
- **PlanetScale** - MySQL, free tier

---

## 📋 ALL VALUES (Copy This Block)

```
VITE_API_URL=https://visionframe-app.vercel.app/api
PYTHONUNBUFFERED=1
CORS_ORIGINS=https://visionframe-app.vercel.app
DATABASE_URL=sqlite:///tmp/visionframe.db
```

---

## 🎯 Quick Add Instructions

1. Open: https://vercel.com/dashboard
2. Click: **visionframe-app**
3. Click: **Settings** tab
4. Click: **Environment Variables** (left sidebar)
5. For each variable above:
   - Click **"+ Add"** button
   - Enter the **Key** name
   - Enter the **Value**
   - Check all 3 boxes (Production, Preview, Development)
   - Click **Save**
6. After all 4 are added:
   - Go to **Deployments** tab
   - Click the **⋯** menu on latest deployment
   - Click **Redeploy**

---

## ✅ Test After Deployment

**Your Site:** https://visionframe-app.vercel.app

**Test Checklist:**
- [ ] Homepage loads with hero carousel
- [ ] Products display in grid
- [ ] Click product → Detail page works
- [ ] AR Try-On button visible
- [ ] Cart icon in navbar works
- [ ] Open browser console (F12) → No CORS errors
- [ ] Network tab → API calls go to `/api/*`

**API Health Check:**
- Visit: https://visionframe-app.vercel.app/api/health
- Should return: `{"status": "ok", "service": "visionframe-backend", ...}`

---

## 🐛 Troubleshooting

**If you see CORS errors:**
- Verify `CORS_ORIGINS` has no trailing slash: ✓ `https://visionframe-app.vercel.app`
- Click **Redeploy** after adding variables

**If API calls fail:**
- Verify `VITE_API_URL` includes `/api`: ✓ `https://visionframe-app.vercel.app/api`
- Check Function Logs in Vercel Dashboard

**If products don't load:**
- Database needs migration (SQLite limitations on Vercel)
- Consider using Vercel Postgres from Storage tab

---

## 🎉 Ready to Deploy!

After adding all 4 variables and redeploying:
- ✅ Frontend will connect to backend correctly
- ✅ CORS will work properly
- ✅ Logs will display in Vercel
- ✅ Your app will be live at https://visionframe-app.vercel.app

**Questions?** Check `VERCEL_ENV_VARIABLES.md` for detailed guide.
