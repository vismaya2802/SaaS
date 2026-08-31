# RAILWAY DEPLOYMENT FIX

## Issue
Railway's Railpack cannot find the start command because:
- Project root doesn't have main.py or app.py
- Backend is in a subdirectory

## SOLUTION: Create Configuration Files

Run these commands in PowerShell from your project root:

### 1. Create Procfile
```
'web: cd backend && python -m uvicorn app.main:app' > Procfile
```

### 2. Create railway.toml
```
@'
[build]
builder = "nixpacks"

[deploy]
startCommand = "cd backend && python -m uvicorn app.main:app"
'@ > railway.toml
```

### 3. Update requirements.txt (already exists in root, no action needed)

### 4. Commit and push
```
git add Procfile railway.toml
git commit -m "feat: Add Railway configuration files"
git push
```

### 5. Redeploy on Railway
- Go to Railway dashboard
- Click your service
- Click "Deploy" or wait for auto-deploy

## Alternative: Railway Dashboard Configuration

If files don't work, configure directly in Railway:

1. Go to your service settings
2. Under "Deploy" section
3. Set **Start Command** to:
   ```
   cd backend && python -m uvicorn app.main:app
   ```
4. Set **Build Command** to:
   ```
   pip install -r backend/requirements.txt
   ```
5. Click Save

## Environment Variables to Add in Railway

Required:
- CORS_ORIGINS=https://visionframe-app.vercel.app
- PYTHONUNBUFFERED=1

Optional (future):
- DATABASE_URL=(if using PostgreSQL instead of SQLite)

## After Successful Deploy

1. Get your Railway URL: https://[your-app].up.railway.app
2. Test: https://[your-app].up.railway.app/health
3. Seed database: `railway run python backend/seed_products.py`
4. Update Vercel frontend with new API URL

Your backend will be live!
