# ⚡ QUICK REFERENCE: Vercel Environment Variables
# Project: visionframe-app
# URL: https://visionframe-app.vercel.app

## 📋 Copy-Paste These 4 Variables to Vercel

### ✅ VARIABLE 1: VITE_API_URL

```
Key: VITE_API_URL
Value: https://visionframe-app.vercel.app/api
Environments: ✓ Production  ✓ Preview  ✓ Development
```

### ✅ VARIABLE 2: PYTHONUNBUFFERED

```
Key: PYTHONUNBUFFERED
Value: 1
Environments: ✓ Production  ✓ Preview  ✓ Development
```

### ✅ VARIABLE 3: CORS_ORIGINS

```
Key: CORS_ORIGINS
Value: https://visionframe-app.vercel.app
Environments: ✓ Production  ✓ Preview  ✓ Development
```

### ✅ VARIABLE 4: DATABASE_URL

```
Key: DATABASE_URL
Value: sqlite:///tmp/visionframe.db
Environments: ✓ Production  ✓ Preview  ✓ Development
⚠️ Note: For production, use Vercel Postgres or other cloud database
```

---

## 🎯 ALL VALUES IN ONE BLOCK (For Easy Copy-Paste)

```
VITE_API_URL=https://visionframe-app.vercel.app/api
PYTHONUNBUFFERED=1
CORS_ORIGINS=https://visionframe-app.vercel.app
DATABASE_URL=sqlite:///tmp/visionframe.db
```

---

## 🔗 Add Variables Here:
https://vercel.com/dashboard → visionframe-app → Settings → Environment Variables

## 📝 Step-by-Step:

1. Go to Vercel Dashboard
2. Click on **visionframe-app** project
3. Click **Settings** tab
4. Click **Environment Variables** (left sidebar)
5. Add each variable above (click "+ Add" button)
6. For each variable, check all 3 environment boxes:
   - ✓ Production
   - ✓ Preview
   - ✓ Development
7. Click **Save** for each variable
8. After all 4 are added, click **Deployments** tab
9. Click **Redeploy** on the latest deployment

---

## ✅ Verification After Deploy

Visit: https://visionframe-app.vercel.app

Test:
- Homepage loads ✓
- Products display ✓
- API calls work ✓
- No CORS errors ✓

---

## 📖 Full Guide: See VERCEL_ENV_VARIABLES.md
