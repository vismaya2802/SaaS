# 🚀 Vercel Deployment Guide

Complete step-by-step guide to deploy VisionFrame to Vercel with auto-deployment.

---

## ⚠️ Error Found: Project Name Invalid

### The Problem
```
❌ "A Project name can only contain up to 100 lowercase letters, digits, 
    and the characters '-', '_', and '.'."
```

**Current name:** `SaaS` (contains uppercase letters ❌)  
**Solution:** Change to lowercase name like `saas`, `visionframe-saas`, or `saas-app` ✅

---

## 📋 Prerequisites

Before deploying, ensure:
- ✅ GitHub repository: https://github.com/vismaya2802/SaaS
- ✅ Vercel account: https://vercel.com/signup
- ✅ Latest code pushed to GitHub
- ✅ Both backend and frontend code ready

---

## Step 1: Push Code to GitHub

### 1.1 Verify changes are staged

```powershell
cd "c:\Users\Vismaya Nair\Downloads\Vismaya College Project\Vismaya College Project\lenskart-saas"
git status
```

Should show:
```
On branch main
Your branch is ahead of 'origin/main' by 2 commits.
nothing to commit, working tree clean
```

### 1.2 Push to GitHub

**First time SSH may require interaction:**

```powershell
git push origin main
```

**If SSH fails, use HTTPS:**

```powershell
# Switch to HTTPS
git remote set-url origin https://github.com/vismaya2802/SaaS.git

# Push with HTTPS
git push origin main

# Enter credentials when prompted:
# Username: vismaya2802
# Password: (use GitHub personal access token from https://github.com/settings/tokens)
```

### 1.3 Verify push succeeded

```powershell
git status
# Should show: "Your branch is up to date with 'origin/main'."
```

Check on GitHub:
- Go to: https://github.com/vismaya2802/SaaS
- Click "Commits" tab
- You should see your new commits

---

## Step 2: Fix Vercel Project Name Error

### The Fix: Use Lowercase Name

**Invalid names:**
- ❌ `SaaS` (uppercase)
- ❌ `VisionFrame` (uppercase)
- ❌ `SaaS-App` (uppercase)

**Valid names:**
- ✅ `saas` (simple, lowercase)
- ✅ `visionframe-saas` (descriptive, lowercase)
- ✅ `visionframe-app` (alternative)
- ✅ `lenskart-saas` (matches repo folder)

**Recommended:** `visionframe-saas` (clear and descriptive)

---

## Step 3: Connect GitHub to Vercel

### 3.1 Create Vercel Account

1. Go to: https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub

### 3.2 Import GitHub Repository

**Option A: From Vercel Dashboard**

1. Go to: https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Click "Import Git Repository"
4. Paste: `https://github.com/vismaya2802/SaaS`
5. Click "Continue"

**Option B: Direct Import**

1. Go to: https://vercel.com/new
2. Enter repository: `vismaya2802/SaaS`
3. Click "Import"

### 3.3 Configure Project Settings

**Project Name:**
```
Change from: SaaS
Change to:   visionframe-saas  ✅
```

**Framework:** 
- Select: **Vite** (React + Vite)

**Root Directory:**
- Set to: `frontend` (our React app is here)

**Environment Variables:**
- Add VITE_API_URL: `https://your-backend-url.com`

---

## Step 4: Deploy to Vercel

### 4.1 Create Environment File

Create `.env.local` in `frontend/`:

```env
# Frontend API URL (for production)
VITE_API_URL=https://your-backend-api.vercel.app

# Or during deployment, use relative path:
VITE_API_URL=/api
```

### 4.2 Configure Build Settings

In Vercel dashboard, set:

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```bash
dist
```

**Install Command:**
```bash
npm ci
```

### 4.3 Deploy

1. Click "Deploy" button in Vercel
2. Wait for build to complete (3-5 minutes)
3. Once deployed, you'll get a Vercel URL like:
   ```
   https://visionframe-saas.vercel.app
   ```

---

## Step 5: Setup Auto-Deployment

### 5.1 Enable Auto-Deployment (Default)

Vercel automatically deploys on every push to main branch.

**To verify:**
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Check "Deployments" tab
4. Should show recent deployments

### 5.2 Set Production Branch

1. Click "Settings" in Vercel
2. Go to "Git"
3. Set **Production Branch** to: `main`
4. Set **Preview Branches** to: `develop` (if you create one)

### 5.3 GitHub App Integration

Vercel automatically integrates with GitHub:
- ✅ Monitors main branch for changes
- ✅ Deploys on every push
- ✅ Creates preview deployments for PRs
- ✅ Shows deployment status on GitHub PRs

---

## Step 6: Backend Deployment (Optional)

### Option A: Deploy Backend to Vercel

Vercel also supports Python/Node backends:

1. Create new project in Vercel
2. Select `backend` folder as root
3. Select **Python** as runtime
4. Vercel will detect `requirements.txt`
5. Deploy similarly

### Option B: Keep Backend Local

For development:
```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend  
cd frontend
npm run dev
```

---

## Complete Deployment Checklist

### Pre-Deployment
- [ ] All changes committed locally
- [ ] Code pushed to GitHub main branch
- [ ] GitHub branch up to date: `git status`
- [ ] Vercel account created
- [ ] GitHub connected to Vercel

### Vercel Setup
- [ ] New project created with valid name (lowercase)
- [ ] Repository selected: `vismaya2802/SaaS`
- [ ] Root directory: `frontend`
- [ ] Framework: **Vite**
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Deployment
- [ ] Environment variables set
- [ ] Deploy button clicked
- [ ] Build completed successfully
- [ ] Live URL generated and working
- [ ] Auto-deployment enabled

### Post-Deployment
- [ ] Vercel URL accessible
- [ ] Pages load correctly
- [ ] API calls working (if backend connected)
- [ ] GitHub shows "Vercel/production" status

---

## 🔗 Useful URLs

**After Deployment:**
- Vercel Dashboard: https://vercel.com/dashboard
- Your Project: https://vercel.com/dashboard/projects
- Deployed App: https://visionframe-saas.vercel.app (example)
- GitHub Repo: https://github.com/vismaya2802/SaaS

---

## 🔄 Workflow After Deployment

### For Every Update:

```powershell
# 1. Make changes locally
# Edit files in VS Code

# 2. Stage and commit
git add .
git commit -m "feat(scope): description"

# 3. Push to GitHub
git push origin main

# 4. Vercel automatically deploys!
# Check status: https://vercel.com/dashboard
```

### For Testing Before Production:

```powershell
# 1. Create feature branch
git checkout -b feat/my-feature

# 2. Make changes and push
git add .
git commit -m "feat(scope): description"
git push origin feat/my-feature

# 3. Create Pull Request on GitHub
# Vercel creates preview deployment automatically

# 4. Test preview URL
# URL shown in PR comments

# 5. After testing, merge to main
# Vercel deploys to production
```

---

## 🚨 Troubleshooting

### Error: "Project name contains invalid characters"

**Solution:** Use only lowercase letters, digits, hyphens, underscores, dots
```
❌ SaaS, VisionFrame, My-Project-SaaS
✅ saas, visionframe, my-project-saas
```

### Error: "Build failed"

**Check:**
1. Go to Vercel dashboard
2. Click "Deployments" tab
3. View build logs for errors
4. Common causes:
   - Missing dependencies: Run `npm install`
   - Wrong root directory: Set to `frontend`
   - Environment variables: Check `.env.local`

### Error: "Cannot find module"

**Solution:**
1. Ensure `package.json` is in root of frontend
2. Verify all dependencies in `package-lock.json`
3. Run locally: `npm install && npm run build`

### Error: "API calls failing"

**Solution:**
1. Set `VITE_API_URL` environment variable
2. Point to backend URL (local, another Vercel project, or external API)
3. Check CORS headers on backend

---

## 📊 Deployment Architecture

```
┌─────────────────────┐
│   GitHub Repository │
│   (vismaya2802/SaaS)│
└──────────┬──────────┘
           │
           │ Push to main
           ▼
┌─────────────────────┐
│  Vercel Platform    │
│ (Auto-Deploy on     │
│  Push to main)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Production URL     │
│ visionframe-saas    │
│  .vercel.app        │
└─────────────────────┘
```

---

## 📈 Next Steps After Deployment

1. **Monitor Performance**
   - Check Vercel Analytics dashboard
   - Monitor build times
   - Track deployment history

2. **Setup Monitoring**
   - Add error tracking (e.g., Sentry)
   - Setup logging
   - Monitor API performance

3. **Optimize Deployment**
   - Enable caching
   - Setup edge functions
   - Optimize images and assets

4. **CI/CD Integration**
   - Run tests before deploy
   - Add status checks to PRs
   - Setup automated deployments

---

## 💡 Pro Tips

1. **Feature Branches**
   - Always develop in feature branches
   - Create PRs before merging
   - Vercel creates preview deployments

2. **Environment Variables**
   - Use `.env.local` for development
   - Set production vars in Vercel dashboard
   - Never commit `.env` files

3. **Rollback**
   - To revert deployment: Go to Vercel → Deployments → Select old version
   - Or push new commit to GitHub

4. **Custom Domain**
   - Go to Vercel dashboard
   - Click "Settings" → "Domains"
   - Add custom domain if you have one

---

**Status:** Ready to Deploy ✅  
**Last Updated:** August 31, 2026  
**Repository:** vismaya2802/SaaS

