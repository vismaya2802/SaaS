# 🔐 Environment Variables Configuration Guide

## 📋 Overview

This guide explains all environment variables needed for VisionFrame deployment on Vercel.

---

## 🚀 Quick Setup for Vercel

### Step 1: Get Your Vercel Project URL

After creating your Vercel project, your URL will be:
```
https://[your-project-name].vercel.app
```

**Example:**
- Project Name: `visionframe-saas`
- URL: `https://visionframe-saas.vercel.app`

### Step 2: Add Environment Variables to Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these **4 REQUIRED** variables:

---

## ✅ REQUIRED ENVIRONMENT VARIABLES

### 1. VITE_API_URL
**Value:** `https://[your-project-name].vercel.app/api`

**Example:**
```
https://visionframe-saas.vercel.app/api
```

**Environment:** Production, Preview, Development (All three checkboxes)

**Description:** Frontend uses this to connect to backend API

---

### 2. PYTHONUNBUFFERED
**Value:** `1`

**Environment:** Production, Preview, Development (All three checkboxes)

**Description:** Enables real-time Python logging in Vercel

---

### 3. CORS_ORIGINS
**Value:** `https://[your-project-name].vercel.app`

**Example:**
```
https://visionframe-saas.vercel.app
```

**Environment:** Production, Preview, Development (All three checkboxes)

**Description:** Allows frontend to make API requests to backend

---

### 4. DATABASE_URL
**Value:** `sqlite:///tmp/visionframe.db`

**⚠️ IMPORTANT:** SQLite on Vercel has limitations (read-only filesystem, data lost on redeploy)

**For Production, use a cloud database:**

**Option A - Vercel Postgres (Recommended):**
```
postgres://user:password@host:5432/visionframe
```
*Get this from: Vercel Dashboard → Storage → Create Database → Postgres*

**Option B - Supabase (Free tier available):**
```
postgres://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```
*Get this from: Supabase Dashboard → Project Settings → Database*

**Option C - PlanetScale (MySQL, Free tier):**
```
mysql://user:password@host:3306/visionframe
```
*Get this from: PlanetScale Dashboard → Your Database → Connect*

**Environment:** Production, Preview, Development (All three checkboxes)

**Description:** Database connection string

---

## 📝 How to Add Variables in Vercel

### Method 1: Web Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click your project
3. Click **Settings** tab
4. Click **Environment Variables** (left sidebar)
5. For each variable:
   - **Key:** Variable name (e.g., `VITE_API_URL`)
   - **Value:** Variable value (e.g., `https://visionframe-saas.vercel.app/api`)
   - **Environments:** Check all 3 boxes (Production, Preview, Development)
   - Click **Save**

### Method 2: Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add VITE_API_URL production
# Paste: https://[your-project-name].vercel.app/api

vercel env add PYTHONUNBUFFERED production
# Paste: 1

vercel env add CORS_ORIGINS production
# Paste: https://[your-project-name].vercel.app

vercel env add DATABASE_URL production
# Paste: your database connection string
```

---

## 🔧 Local Development Setup

### Step 1: Create `.env.local` file

In your project root, create `.env.local`:

```bash
# Frontend
VITE_API_URL=http://localhost:8000

# Backend
PYTHONUNBUFFERED=1
DATABASE_URL=sqlite:///./data/visionframe.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Step 2: Update `.gitignore`

Ensure `.env.local` is ignored:

```bash
# Add to .gitignore
.env.local
.env*.local
.env.production.local
```

---

## 🎯 Complete Environment Variables Table

| Variable | Local Development | Vercel Production | Required |
|----------|------------------|-------------------|----------|
| `VITE_API_URL` | `http://localhost:8000` | `https://[project].vercel.app/api` | ✅ Yes |
| `PYTHONUNBUFFERED` | `1` | `1` | ✅ Yes |
| `DATABASE_URL` | `sqlite:///./data/visionframe.db` | Cloud database URL | ✅ Yes |
| `CORS_ORIGINS` | `http://localhost:5173` | `https://[project].vercel.app` | ✅ Yes |
| `JWT_SECRET` | Any string | Secure random string | ⚠️ Future |
| `OTP_EXPIRY_MINUTES` | `5` | `5` | ⚠️ Future |
| `SMS_API_KEY` | - | Your SMS provider key | ⚠️ Future |
| `RAZORPAY_KEY_ID` | - | Your Razorpay key | ⚠️ Future |
| `RAZORPAY_KEY_SECRET` | - | Your Razorpay secret | ⚠️ Future |

---

## 🔐 Generating Secure Secrets

### JWT_SECRET (for future authentication)

**Method 1 - OpenSSL:**
```bash
openssl rand -base64 32
```

**Method 2 - Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Method 3 - Python:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Method 4 - Online:**
```
https://generate-secret.vercel.app/32
```

---

## ✅ Verification Checklist

After adding environment variables:

### In Vercel Dashboard:
- [ ] Go to Settings → Environment Variables
- [ ] Verify all 4 required variables are present
- [ ] Verify all have checkboxes for Production, Preview, Development
- [ ] Click **Redeploy** to apply changes

### After Deployment:
- [ ] Open browser console (F12)
- [ ] Navigate to your deployed site
- [ ] Check Network tab for API calls
- [ ] Verify API calls go to `/api/*` endpoints
- [ ] Check for CORS errors (should be none)

---

## 🐛 Troubleshooting

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Solution:** Check `CORS_ORIGINS` includes your frontend URL without trailing slash:
```
✅ https://visionframe-saas.vercel.app
❌ https://visionframe-saas.vercel.app/
```

### Error: "Failed to fetch" or "Network Error"

**Solution:** Check `VITE_API_URL` includes `/api`:
```
✅ https://visionframe-saas.vercel.app/api
❌ https://visionframe-saas.vercel.app
```

### Error: "Database connection failed"

**Solution:** 
1. Verify `DATABASE_URL` format is correct
2. For Vercel Postgres: Use connection string from Vercel Storage
3. Test connection string locally first

### Error: "Environment variable not found"

**Solution:**
1. Redeploy after adding variables
2. Check variable names are EXACT (case-sensitive)
3. Verify environments are checked (Production, Preview, Development)

---

## 📦 Database Migration for Production

### If Using Vercel Postgres:

1. **Create database in Vercel:**
   - Go to Storage tab → Create Database → Postgres
   - Copy connection string

2. **Update environment variable:**
   - Settings → Environment Variables → DATABASE_URL
   - Paste Vercel Postgres connection string

3. **Run migrations:**
   ```bash
   # Install psycopg2 for Postgres support
   pip install psycopg2-binary
   
   # Update requirements.txt
   echo "psycopg2-binary==2.9.9" >> backend/requirements.txt
   ```

4. **Update backend code:**
   ```python
   # backend/app/database.py
   # SQLAlchemy will auto-detect Postgres from DATABASE_URL
   # No code changes needed!
   ```

---

## 🚀 After Configuration

Once all environment variables are set:

1. **Redeploy:** Click "Redeploy" in Vercel Dashboard
2. **Test:** Visit your deployed URL
3. **Check Logs:** Vercel Dashboard → Deployments → View Function Logs
4. **Verify:** Test login, products, AR try-on, cart functionality

---

## 📞 Support

If you encounter issues:

1. Check Vercel Function Logs for error messages
2. Verify all 4 required variables are set correctly
3. Test API endpoint directly: `https://[project].vercel.app/api/health`
4. Check browser console for CORS or network errors

---

**Last Updated:** August 31, 2026  
**Vercel Version:** 2  
**Status:** ✅ Production Ready
