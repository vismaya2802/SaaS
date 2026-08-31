# 🔑 Vercel Environment Variables Setup

Complete guide to import environment variables into Vercel.

---

## 📁 Files Created

Two `.env` files are now in your repository root:

1. **`.env.production`** - Production environment variables
2. **`.env.example`** - Example template (reference only)

Both contain:
```
VITE_API_URL=https://saasvf.vercel.app/api
PYTHONUNBUFFERED=1
```

---

## ⚙️ How to Import into Vercel

### Option 1: Manual Import (Recommended if Deploy Button Visible)

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/dashboard/saasvf
   ```

2. **Click "Settings"**

3. **Click "Environment Variables"**

4. **Add Variables Manually:**
   - Key: `VITE_API_URL`
   - Value: `https://saasvf.vercel.app/api`
   - Click "Add More"
   
   - Key: `PYTHONUNBUFFERED`
   - Value: `1`
   - Click "Save"

---

### Option 2: Import from .env File (If Available)

If Vercel has an import option:

1. Go to "Environment Variables" section
2. Look for "Import" or "Upload .env" button
3. Select `.env.production` file
4. Verify values
5. Click "Save"

---

### Option 3: Create New Project with Env File

If Deploy button still missing, try alternative deploy method:

1. **Go to:** https://vercel.com/new
2. **Import GitHub repository:** vismaya2802/saasvf
3. **Let Vercel auto-configure** from vercel.json
4. **When prompted for env vars:**
   - Add: VITE_API_URL = https://saasvf.vercel.app/api
   - Add: PYTHONUNBUFFERED = 1
5. **Click Deploy**

---

## 📋 Environment Variables Explained

### VITE_API_URL
- **What:** Frontend API endpoint
- **Why:** React app needs to know where backend API is
- **Value:** `https://saasvf.vercel.app/api`
- **When to change:** If you use a custom domain

### PYTHONUNBUFFERED
- **What:** Python logging setting
- **Why:** Vercel needs unbuffered output for real-time logs
- **Value:** `1` (enabled)
- **Never change:** This is required for Vercel

---

## 🚀 Next Steps

### If Deploy Button Now Shows:

1. **Go to Vercel Dashboard**
2. **Add environment variables** (see above)
3. **Click Deploy**

### If Deploy Button Still Missing:

Try one of these:

**A. Disconnect & Reconnect Repository**
1. Settings → Git Repository
2. Click "Disconnect"
3. Go to https://vercel.com/new
4. Import repository again
5. Deploy button should appear

**B. Create New Project**
1. Go to https://vercel.com/new
2. Select "GitHub" → authorize
3. Search for "saasvf"
4. Click "Import"
5. Add environment variables
6. Click Deploy

**C. Try Different Browser**
1. Chrome, Edge, Firefox, Safari
2. Clear cache (Ctrl+Shift+Delete)
3. Try again

---

## ✅ Verification After Import

Once variables are imported:

1. **Check they're visible** in Environment Variables section
2. **Verify values are correct** (no typos)
3. **Note the scope:** Production and Preview (or both)
4. **Click Save** if needed

---

## 🔍 Troubleshooting

### Variables Not Showing Up

**Try:**
1. Refresh page (F5)
2. Wait 2-3 seconds
3. Scroll down slowly
4. Try different browser
5. Clear browser cache

### Wrong Values Showing

**Fix:**
1. Delete the variable (X button)
2. Re-add with correct value
3. Click Save

### Deploy Button Still Missing After Adding Vars

**Try:**
1. Go to: https://vercel.com/new
2. Create new project with GitHub repo
3. Import will auto-detect settings
4. Deploy button will appear

---

## 📝 Using .env File in Local Development

If you want to use `.env.production` locally:

**For Frontend (in frontend/ directory):**
```
VITE_API_URL=http://localhost:8000
```

**For Backend (in backend/ directory):**
```
PYTHONUNBUFFERED=1
```

---

## 🎯 What Happens with These Variables

### During Build:
- Vercel reads the variables
- Frontend app uses VITE_API_URL to call backend
- Backend uses PYTHONUNBUFFERED for logging

### During Runtime:
- Frontend knows where backend API is
- Backend logs appear in real-time
- Everything works together

### In Production:
- Frontend calls: https://saasvf.vercel.app/api
- Backend listens on dynamic PORT
- API requests flow correctly

---

## 🆘 If You Need Different Values

### Custom Domain (When You Get One):
```
VITE_API_URL=https://yourdomain.com/api
PYTHONUNBUFFERED=1
```

### Local Development:
```
VITE_API_URL=http://localhost:8000
PYTHONUNBUFFERED=1
```

### Testing Environment:
```
VITE_API_URL=https://staging-saasvf.vercel.app/api
PYTHONUNBUFFERED=1
```

---

## ✨ Files Reference

### .env.production
Contains production environment variables.

**Note:** This file is committed to GitHub (it's for production URLs, not secrets)

### .env.example
Template showing what variables are needed.

**Use:** Reference for what variables are required

### .gitignore
Both .env files are tracked (no secrets in them).

---

## 🚀 Ready to Deploy!

Once environment variables are set in Vercel:

1. **Click Deploy**
2. **Wait 5-10 minutes**
3. **Your SaaS is LIVE!** 🎉

---

## 📞 Quick Summary

**Files Created:**
- ✅ .env.production (for Vercel)
- ✅ .env.example (reference)

**What to Do:**
1. Import variables into Vercel OR
2. Add them manually in Environment Variables section
3. Click Save
4. Deploy

**Result:**
- ✅ Frontend knows where API is
- ✅ Backend logs correctly
- ✅ Everything works together

**Next:** Go to Vercel and try deploying! 🚀

