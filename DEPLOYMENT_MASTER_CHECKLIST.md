# 🚀 Complete Deployment Master Checklist

Complete guide from GitHub to Vercel with auto-deployment and GitHub Actions.

---

## ✅ Phase 1: Push Code to GitHub (5 mins)

- [ ] **Open PowerShell**
  - Close and reopen to get fresh PATH

- [ ] **Navigate to project**
  ```powershell
  cd "c:\Users\Vismaya Nair\Downloads\Vismaya College Project\Vismaya College Project\lenskart-saas"
  ```

- [ ] **Verify changes**
  ```powershell
  git status
  ```
  Should show: "working tree clean" ✅

- [ ] **View commits to push**
  ```powershell
  git log --oneline -3
  ```
  Should show your recent commits

- [ ] **Push to GitHub**
  ```powershell
  git push origin main
  ```
  
  **If first SSH push, accept host key:**
  ```
  Type: yes
  Press: Enter
  ```

  **If SSH fails, use HTTPS:**
  ```powershell
  git remote set-url origin https://github.com/vismaya2802/SaaS.git
  git push origin main
  Username: vismaya2802
  Password: (GitHub personal token from https://github.com/settings/tokens)
  ```

- [ ] **Verify push succeeded**
  ```powershell
  git status
  # Should say: "Your branch is up to date with 'origin/main'."
  ```

- [ ] **Check on GitHub**
  Go to: https://github.com/vismaya2802/SaaS/commits/main
  Should see your new commits ✅

---

## ✅ Phase 2: Create Vercel Account (2 mins)

- [ ] **Go to Vercel**
  https://vercel.com/signup

- [ ] **Sign up with GitHub**
  Click "Continue with GitHub"

- [ ] **Authorize Vercel**
  Grant Vercel access to your repos

- [ ] **Verify account created**
  You should see: Vercel dashboard ✅

---

## ✅ Phase 3: Fix Error & Deploy to Vercel (5 mins)

### 🔴 THE ERROR YOU'RE FIXING:
```
"A Project name can only contain up to 100 lowercase letters, 
 digits, and the characters '-', '_', and '.'."
```

**Reason:** `SaaS` has uppercase letters  
**Solution:** Use lowercase like `visionframe-saas` or `saas`

### Deployment Steps:

- [ ] **Go to Vercel new project**
  https://vercel.com/new

- [ ] **Import repository**
  Click "Import Git Repository"

- [ ] **Paste GitHub URL**
  https://github.com/vismaya2802/SaaS
  Click "Continue"

- [ ] **⚠️ FIX THE ERROR HERE:**
  Find: **"Private Repository Name"** field
  
  Change from: `SaaS` ❌
  
  Change to: `visionframe-saas` ✅

- [ ] **Select framework**
  Framework dropdown → Select **"Vite"**

- [ ] **Set root directory**
  Root Directory → Click and select **"frontend"**

- [ ] **Configure other settings**
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm ci`

- [ ] **Click "Deploy"**
  Wait 3-5 minutes for build to complete

- [ ] **Verify deployment successful**
  Should see: Green checkmark ✅
  Live URL: https://visionframe-saas.vercel.app ✅

---

## ✅ Phase 4: Get Vercel Secrets for GitHub Actions (5 mins)

### Secret 1: Vercel Token

- [ ] **Go to Vercel tokens**
  https://vercel.com/account/tokens

- [ ] **Create new token**
  Click "Create"

- [ ] **Configure token**
  - Name: `GitHub Actions`
  - Expiration: `No expiration`
  - Click "Create"

- [ ] **Copy token**
  Save it somewhere (you'll use it in next step)

### Secret 2: Vercel Organization ID

- [ ] **Go to Vercel account settings**
  https://vercel.com/account/settings

- [ ] **Find "Vercel ID"**
  Look for "Vercel ID" field
  Copy the ID (looks like: `tez...`)

### Secret 3: Project ID

- [ ] **Go to Vercel dashboard**
  https://vercel.com/dashboard

- [ ] **Click your project**
  `visionframe-saas`

- [ ] **Go to Settings**
  Click "Settings" tab

- [ ] **Find Project ID**
  Look for "Project ID" field (on right side)
  Copy the ID

---

## ✅ Phase 5: Add Secrets to GitHub (3 mins)

- [ ] **Go to GitHub repo settings**
  https://github.com/vismaya2802/SaaS/settings/secrets/actions

- [ ] **Click "New repository secret"**

- [ ] **Add Secret #1: VERCEL_TOKEN**
  - Name: `VERCEL_TOKEN`
  - Value: Paste your Vercel token from Phase 4
  - Click "Add secret"

- [ ] **Add Secret #2: VERCEL_ORG_ID**
  - Name: `VERCEL_ORG_ID`
  - Value: Paste your Vercel ID from Phase 4
  - Click "Add secret"

- [ ] **Add Secret #3: VERCEL_PROJECT_ID**
  - Name: `VERCEL_PROJECT_ID`
  - Value: Paste your Project ID from Phase 4
  - Click "Add secret"

- [ ] **Verify all 3 secrets added**
  You should see them listed ✅

---

## ✅ Phase 6: Enable GitHub Actions (2 mins)

- [ ] **Go to GitHub repo settings**
  https://github.com/vismaya2802/SaaS/settings/actions

- [ ] **Select workflow permissions**
  Click: "Allow all actions and reusable workflows"

- [ ] **Click "Save"**

- [ ] **Verify GitHub Actions enabled**
  Go to: https://github.com/vismaya2802/SaaS/actions
  Should see workflow files listed ✅

---

## ✅ Phase 7: Test Auto-Deployment (5 mins)

- [ ] **Make a test change locally**
  ```powershell
  # Edit a file
  code frontend/src/App.jsx
  # Make a small change (add a comment, change text)
  # Save the file
  ```

- [ ] **Commit and push**
  ```powershell
  git add frontend/src/App.jsx
  git commit -m "test: verify auto-deployment is working"
  git push origin main
  ```

- [ ] **Watch GitHub Actions**
  Go to: https://github.com/vismaya2802/SaaS/actions
  Should see workflow running (blue dot) ✅

- [ ] **Watch Vercel deployment**
  Go to: https://vercel.com/dashboard/visionframe-saas/deployments
  Should see deployment building ✅

- [ ] **Verify deployment successful**
  After 3-5 minutes:
  - GitHub Actions: Should show green checkmark
  - Vercel: Should show "Deployed"
  - Live app: https://visionframe-saas.vercel.app should show changes ✅

---

## ✅ Phase 8: Setup Complete - Final Verification (2 mins)

- [ ] **GitHub repo status**
  ```powershell
  git status
  # Should say: "Your branch is up to date with 'origin/main'."
  ```

- [ ] **Live URL working**
  Visit: https://visionframe-saas.vercel.app
  App should load and work ✅

- [ ] **GitHub Actions workflow**
  Visit: https://github.com/vismaya2802/SaaS/actions
  Should show recent successful deployments ✅

- [ ] **Vercel dashboard**
  Visit: https://vercel.com/dashboard/visionframe-saas
  Should show "Production" deployment ✅

- [ ] **Auto-deployment verified**
  Your last push automatically deployed ✅

---

## 🎯 Summary: You Now Have

✅ **GitHub Repository** - Code stored and versioned  
✅ **Vercel Deployment** - App live on the internet  
✅ **Auto-Deployment** - Every push to main deploys automatically  
✅ **GitHub Actions** - CI/CD pipeline running tests  
✅ **Preview Deployments** - PRs get preview URLs  
✅ **Monitoring** - Can view deployment history anytime  

---

## 🔄 Daily Workflow After Setup

### Make Updates:
```powershell
# 1. Edit files locally
code frontend/src/components/Navbar.jsx

# 2. Test locally
cd frontend && npm run dev
# Test in browser: http://localhost:5173

# 3. Commit and push
git add .
git commit -m "feat(navbar): add dark mode toggle"
git push origin main

# 4. Vercel automatically deploys!
# View deployment: https://vercel.com/dashboard/visionframe-saas/deployments
# Live app updates: https://visionframe-saas.vercel.app
```

### For Feature Branches:
```powershell
# 1. Create feature branch
git checkout -b feat/add-wishlist

# 2. Make changes and push
git push origin feat/add-wishlist

# 3. Create Pull Request on GitHub
# Vercel creates preview deployment automatically

# 4. Test preview URL (shown in PR)

# 5. Merge PR to main
# Vercel deploys to production automatically
```

---

## 📊 Architecture After Setup

```
┌─────────────────────────────────────────┐
│        Your Local Machine               │
│   (Edit files, test, commit)            │
└─────────────┬──────────────────────────┘
              │
              │ git push origin main
              ▼
┌─────────────────────────────────────────┐
│      GitHub Repository                  │
│   (vismaya2802/SaaS)                    │
└─────────────┬──────────────────────────┘
              │
              │ Webhook trigger
              ▼
┌─────────────────────────────────────────┐
│     GitHub Actions                      │
│   (.github/workflows/vercel-deploy.yml) │
│   - Lints code                          │
│   - Builds project                      │
│   - Deploys to Vercel                   │
└─────────────┬──────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│       Vercel Platform                   │
│   (Auto-deployment enabled)             │
└─────────────┬──────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Live Production App                │
│   https://visionframe-saas.vercel.app   │
│   (Accessible worldwide)                │
└─────────────────────────────────────────┘
```

---

## 🚨 Troubleshooting

### Deployment Failed

1. Go to: GitHub → Actions tab
2. Click the red ❌ workflow
3. Scroll down to see error
4. **Common errors:**
   - `npm: command not found` → Vercel config issue
   - `Build failed` → Code error
   - `Permission denied` → Secret not set correctly

**Fix:** Correct the error locally, push again

### GitHub Actions Not Running

1. Check: https://github.com/vismaya2802/SaaS/settings/actions
2. Verify: "Allow all actions and reusable workflows" selected
3. Verify: All 3 secrets are added correctly
4. Try: Manual push again with `git push origin main`

### Vercel Deployment Stuck

1. Go to: https://vercel.com/dashboard/visionframe-saas
2. Click failed deployment
3. View build logs
4. Fix locally and push again

### Live App Not Updating

1. Wait 2-3 minutes after deployment completes
2. Hard refresh browser: `Ctrl + F5`
3. Check deployment succeeded: https://vercel.com/dashboard/visionframe-saas/deployments

---

## 📞 Support Links

- **Vercel Docs:** https://vercel.com/docs
- **GitHub Actions:** https://docs.github.com/en/actions
- **Vite Docs:** https://vitejs.dev/
- **React Docs:** https://react.dev/

---

## 🎉 Congratulations!

Your VisionFrame SaaS application is now:
- ✅ **Stored on GitHub** - Version controlled and backed up
- ✅ **Deployed on Vercel** - Live on the internet
- ✅ **Auto-deploying** - Every push triggers new deployment
- ✅ **Monitored** - GitHub Actions runs tests
- ✅ **Production Ready** - Accessible worldwide

**Your live app:** https://visionframe-saas.vercel.app

**Share with others:** Send this link to anyone!

---

**Total Setup Time:** ~30 minutes  
**Status:** ✅ Complete  
**Last Updated:** August 31, 2026

