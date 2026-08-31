# 🔄 Vercel Auto-Deployment & GitHub Actions Setup

Setup automatic deployments and GitHub Actions integration.

---

## Overview

```
Your Workflow:

1. Edit code locally
2. Commit and push to GitHub
3. GitHub Actions runs tests ✅
4. Vercel auto-deploys ✅
5. Your app goes live automatically! 🚀
```

---

## Part 1: Setup Vercel for Auto-Deployment (5 mins)

### 1.1 Connect Vercel to GitHub (Default)

When you deploy to Vercel from a GitHub repo:
- ✅ Auto-deployment is enabled by default
- ✅ Every push to `main` triggers deployment
- ✅ PR creates preview deployments

### 1.2 Verify Auto-Deployment is Enabled

1. Go to: https://vercel.com/dashboard
2. Click your project (`visionframe-saas`)
3. Click "Settings" → "Git"
4. Verify:
   - ✅ **Production Branch:** `main`
   - ✅ **Framework Preset:** `Next.js` (or `Vite`)
   - ✅ **Deploy on Push:** Enabled

### 1.3 Test Auto-Deployment

```powershell
# Make a small change
code frontend/src/App.jsx
# Edit and save

# Commit and push
git add frontend/src/App.jsx
git commit -m "test: verify auto-deployment"
git push origin main

# Watch deployment in real-time:
# https://vercel.com/dashboard/visionframe-saas/deployments
```

---

## Part 2: GitHub Actions Integration (Optional but Recommended)

### Why GitHub Actions?

- ✅ Runs tests before deployment
- ✅ Prevents broken code from deploying
- ✅ Shows deployment status in PRs
- ✅ Auto-comments preview URLs

### 2.1 Get Vercel Token

1. Go to: https://vercel.com/account/tokens
2. Click "Create"
3. Name: `GitHub Actions`
4. Expiration: `No expiration`
5. **Copy the token** (you'll need it)

### 2.2 Add Secrets to GitHub

1. Go to: https://github.com/vismaya2802/SaaS/settings/secrets/actions
2. Click "New repository secret"
3. Add these secrets:

**Secret 1:**
- Name: `VERCEL_TOKEN`
- Value: Paste your Vercel token from step 2.1

**Secret 2:**
- Name: `VERCEL_ORG_ID`
- Get from: https://vercel.com/account/settings
- Look for "Vercel ID" or go to: https://vercel.com/api/whoami

**Secret 3:**
- Name: `VERCEL_PROJECT_ID`
- Get from: Go to your Vercel project → Settings → Project ID

### 2.3 Add Workflow File

The workflow file is already created at `.github/workflows/vercel-deploy.yml`

This file:
- ✅ Runs on every push to `main`
- ✅ Builds your project
- ✅ Deploys to Vercel
- ✅ Creates preview deployments for PRs

---

## Part 3: GitHub Actions Workflow Explained

### File Location
```
.github/workflows/vercel-deploy.yml
```

### What It Does

**On Push to main:**
1. Checks out code from GitHub
2. Installs Vercel CLI
3. Pulls Vercel project settings
4. Builds the project (`npm run build`)
5. Deploys to production
6. Shows success message

**On Pull Request:**
1. Same steps as above
2. Creates preview deployment
3. Comments on PR with preview URL

### Workflow Permissions

The workflow needs GitHub Actions enabled:

1. Go to: https://github.com/vismaya2802/SaaS/settings/actions
2. Select: "Allow all actions and reusable workflows"
3. Click "Save"

---

## Part 4: Monitor Deployments

### View Deployment Status

**In GitHub:**
1. Go to: https://github.com/vismaya2802/SaaS
2. Click "Actions" tab
3. See workflow runs

**In Vercel:**
1. Go to: https://vercel.com/dashboard
2. Click your project
3. See "Deployments" tab

### Check Build Logs

**If deployment fails:**

1. Go to Vercel dashboard
2. Click your project → "Deployments"
3. Click failed deployment
4. Scroll down to see build logs
5. Fix error locally
6. Push again

---

## Part 5: Complete Workflow Example

### Development Workflow

```powershell
# 1. Create feature branch
git checkout -b feat/add-search

# 2. Make changes
code frontend/src/components/SearchBar.jsx
# ... edit and save ...

# 3. Test locally
cd frontend
npm run dev
# Test in browser: http://localhost:5173

# 4. Commit changes
git add frontend/src/components/SearchBar.jsx
git commit -m "feat(search): add product search functionality"

# 5. Push branch
git push origin feat/add-search

# 6. Create Pull Request on GitHub
# Go to: https://github.com/vismaya2802/SaaS/pulls
# Click "New Pull Request"
# Select: main ← feat/add-search

# 7. GitHub Actions runs automatically:
#    - Lints code ✅
#    - Builds project ✅
#    - Creates preview deployment ✅

# 8. Test preview URL (Vercel creates this)

# 9. Merge PR to main
# Click "Merge Pull Request"

# 10. GitHub Actions deploys to production automatically!
# Production goes live at: https://visionframe-saas.vercel.app
```

---

## Part 6: Environment Variables for Vercel

### Set Environment Variables

If your app needs environment variables (API URLs, keys, etc.):

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables:

**Example:**
```
VITE_API_URL = https://your-backend-api.vercel.app
VITE_APP_NAME = VisionFrame
```

3. These are available in your app as:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

---

## Part 7: Troubleshooting Auto-Deployment

### Deployment Not Triggering

**Problem:** Push doesn't trigger deployment

**Solutions:**
1. Verify branch is `main` (not `develop`)
2. Check GitHub Actions enabled: https://github.com/vismaya2802/SaaS/settings/actions
3. Verify secrets are set: https://github.com/vismaya2802/SaaS/settings/secrets/actions

### Build Fails

**Problem:** Build error in GitHub Actions

**Solutions:**
1. Go to: GitHub → Actions tab
2. Click failed workflow
3. View logs
4. Common errors:
   - Missing dependencies: `npm install`
   - Wrong root directory: Verify `frontend` in build command
   - Environment variables missing: Set in Vercel

### Preview URL Not Working

**Problem:** Vercel creates deployment but URL is down

**Solutions:**
1. Wait 2-3 minutes after build completes
2. Hard refresh: Ctrl+F5
3. Check Vercel logs for errors
4. Verify root directory is `frontend`

---

## Part 8: Advanced: Custom Domain

### Add Your Domain to Vercel

1. Go to: Vercel Dashboard → Your Project → Settings → Domains
2. Enter your domain (e.g., `visionframe.com`)
3. Update DNS records as shown in Vercel
4. DNS can take 24-48 hours to propagate

Your app will then be available at your custom domain instead of `vercel.app`

---

## Part 9: Rollback Deployment

### Revert to Previous Version

If something breaks in production:

1. Go to: Vercel Dashboard → Your Project → Deployments
2. Find previous good deployment
3. Click the deployment
4. Click "Promote to Production"

Or simply push a fix:
```powershell
git commit -m "fix: revert breaking change"
git push origin main
# Vercel auto-deploys the fix
```

---

## 📊 Auto-Deployment Architecture

```
┌──────────────────────────────────────┐
│      Local Development               │
│  (Your Computer)                     │
└──────────────┬───────────────────────┘
               │
               │ git push origin main
               ▼
┌──────────────────────────────────────┐
│      GitHub Repository               │
│  (vismaya2802/SaaS)                  │
└──────────────┬───────────────────────┘
               │
               │ Webhook trigger
               ▼
┌──────────────────────────────────────┐
│    GitHub Actions                    │
│  (Runs tests, builds project)        │
└──────────────┬───────────────────────┘
               │
               │ If build succeeds
               ▼
┌──────────────────────────────────────┐
│      Vercel Platform                 │
│  (Auto-deploys to production)        │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│      Live Application                │
│  https://visionframe-saas.vercel.app │
└──────────────────────────────────────┘
```

---

## 🎯 Checklist: Auto-Deployment Ready

- [ ] GitHub repo connected to Vercel
- [ ] Production branch set to `main`
- [ ] Auto-deployment enabled in Vercel
- [ ] Vercel token created
- [ ] GitHub secrets configured:
  - [ ] VERCEL_TOKEN
  - [ ] VERCEL_ORG_ID
  - [ ] VERCEL_PROJECT_ID
- [ ] Workflow file: `.github/workflows/vercel-deploy.yml` created
- [ ] GitHub Actions enabled in repo settings
- [ ] Tested with a test push
- [ ] Deployment successful

---

## 🚀 What's Next?

1. **Monitor in real-time:** Add Vercel Analytics
2. **Setup alerts:** Get notified on deployment failures
3. **Custom domain:** Point your own domain to Vercel
4. **Optimize:** Setup caching and edge functions
5. **Scale:** Split frontend and backend deployments

---

**Status:** Auto-Deployment Ready ✅  
**Last Updated:** August 31, 2026  
**Difficulty:** ⭐⭐ Intermediate

