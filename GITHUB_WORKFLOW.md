# GitHub Workflow Setup

## 📋 Overview

This document describes the complete GitHub workflow for the VisionFrame SaaS project, including CI/CD pipelines, pull request processes, and deployment strategies.

---

## 🔄 GitHub Actions Workflows

### 1. CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

**Triggers:** Push to `main` or `develop`, Pull Requests to `main`

**Jobs:**

1. **Backend Linting & Testing**
   - Sets up Python 3.9
   - Installs dependencies from `requirements.txt`
   - Validates Python syntax
   - Runs backend tests (`test_telemetry.py`)
   - ✓ Passes on valid code

2. **Frontend Build & Lint**
   - Sets up Node.js 18
   - Installs npm dependencies
   - Runs `npm run build`
   - Checks for build warnings
   - ✓ Passes on successful build

3. **Security Checks**
   - Scans for exposed secrets with TruffleHog
   - Runs Safety check on Python dependencies
   - ✓ Flags potential security issues

4. **Deployment Notification**
   - Runs after all checks pass
   - Only on main branch after push
   - Confirms ready for deployment

### 2. Pull Request Review (`.github/workflows/pull-request.yml`)

**Triggers:** Pull Request opened, synchronized, or reopened

**Jobs:**

1. **PR Validation**
   - ✓ Validates PR title follows conventional format
   - ✓ Checks for large files (>10MB)
   - ✓ Generates PR summary (files changed, additions)

2. **Auto-Assign Reviewers**
   - Automatically assigns reviewers on PR open
   - Configured to assign to maintainers

3. **Size Labeling**
   - Automatically labels PRs: `size/small`, `size/medium`, `size/large`
   - Based on number of additions

---

## 📤 Pushing Code to GitHub

### Standard Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch (optional but recommended)
git checkout -b feat/my-feature

# 3. Make changes to files
# ... edit code ...

# 4. Stage changes
git add .

# 5. Commit with conventional format
git commit -m "feat(scope): add new feature"

# 6. Push to GitHub
git push origin feat/my-feature  # or 'main' for direct push

# 7. If on feature branch, create Pull Request on GitHub
# https://github.com/vismaya2802/SaaS/pulls
```

### Step-by-Step: Feature Branch Workflow

**1. Create and checkout feature branch:**
```bash
git checkout -b feat/ar-improvements
```

**2. Make your changes:**
```bash
# Edit files
code frontend/src/components/ARView.jsx
```

**3. Stage and commit:**
```bash
git add frontend/src/components/ARView.jsx
git commit -m "feat(ar): add scale adjustment controls"
```

**4. Push to GitHub:**
```bash
git push origin feat/ar-improvements
```

**5. Create Pull Request:**
- Go to: https://github.com/vismaya2802/SaaS
- Click "Pull requests" tab
- Click "New Pull Request"
- Select `main` as base branch
- Select `feat/ar-improvements` as compare branch
- Add title: `feat(ar): add scale adjustment controls`
- Add description of changes
- Click "Create Pull Request"

**6. GitHub Actions will automatically:**
- ✓ Run CI/CD checks
- ✓ Validate commit format
- ✓ Run linting and tests
- ✓ Check for security issues
- ✓ Auto-assign reviewers

**7. After approval:**
- Click "Merge Pull Request"
- GitHub will merge to `main`
- GitHub Actions will re-run CI/CD
- Your changes are on main!

---

## ✅ Pre-Push Verification Checklist

Before pushing, verify:

```bash
# 1. Check status
git status

# 2. Review changes
git diff

# 3. Pull latest
git pull origin main

# 4. Run tests locally (optional)
cd backend && python test_telemetry.py
cd frontend && npm run build

# 5. Verify no conflicts
git status  # Should show no conflicts

# 6. Stage and commit
git add .
git commit -m "type(scope): description"

# 7. Final check - what will be pushed?
git log origin/main..HEAD

# 8. Push!
git push origin main
```

---

## 📊 GitHub Dashboard

After pushing, monitor your contributions:

### Repository
- **Home:** https://github.com/vismaya2802/SaaS
- **Commits:** https://github.com/vismaya2802/SaaS/commits/main
- **Branches:** https://github.com/vismaya2802/SaaS/branches

### Activity & Reviews
- **Pull Requests:** https://github.com/vismaya2802/SaaS/pulls
- **Issues:** https://github.com/vismaya2802/SaaS/issues
- **Discussions:** https://github.com/vismaya2802/SaaS/discussions (if enabled)

### CI/CD & Deployments
- **Actions:** https://github.com/vismaya2802/SaaS/actions
- **Build Status:** Check workflow runs
- **Deployments:** https://github.com/vismaya2802/SaaS/deployments (if enabled)

---

## 🚀 Example Workflows

### Feature Development

```bash
# 1. Start new feature
git checkout -b feat/wishlist

# 2. Make changes
# - Add wishlist API endpoint
# - Add wishlist frontend component
# - Update product card

git add backend/app/routers/wishlist.py
git commit -m "feat(api): add wishlist endpoints"

git add frontend/src/components/WishlistButton.jsx
git commit -m "feat(ui): add wishlist button to products"

# 3. Push and create PR
git push origin feat/wishlist

# 4. On GitHub: Create PR, wait for checks, merge
```

### Bug Fix

```bash
# 1. Create fix branch
git checkout -b fix/payment-timeout

# 2. Fix the bug
# - Increase timeout in payment service
# - Add retry logic

git add backend/app/services/payment.py
git commit -m "fix(payment): increase request timeout to 30s"

# 3. Push and create PR
git push origin fix/payment-timeout

# 4. GitHub Actions runs tests
# 5. After approval, merge to main
```

### Documentation Update

```bash
# 1. Update docs
git checkout -b docs/api-guide

# 2. Update API documentation
git add docs/API.md
git commit -m "docs: add payment endpoint documentation"

# 3. Push and merge
git push origin docs/api-guide
```

---

## 🔐 SSH Key Setup

Your repository uses SSH authentication. Verify it's working:

```bash
# Test SSH connection
ssh -T git@github.com

# Expected output:
# Hi vismaya2802! You've successfully authenticated, but GitHub does not provide shell access.
```

If you see an error, add your SSH key to GitHub:
1. Generate key: `ssh-keygen -t ed25519 -C "your@email.com"`
2. Go to: https://github.com/settings/keys
3. Add SSH public key
4. Test connection again

---

## 🚨 Troubleshooting

### "Permission denied" on push

```bash
# Verify SSH connection
ssh -T git@github.com

# Check remote
git remote -v

# Should show: git@github.com:vismaya2802/SaaS.git
```

### PR checks failing

**Check why:**
1. Go to: https://github.com/vismaya2802/SaaS/actions
2. Click on the failed workflow
3. Review error logs
4. Fix locally and recommit

**Common failures:**
- Syntax error: Fix in editor
- Test failure: Ensure tests pass locally
- Lint error: Follow code style

### Merge conflicts

```bash
# Pull latest changes
git pull origin main

# Edit conflicted files (look for <<<<<<, ======, >>>>>>>)
# Fix conflicts and save

# Stage and commit
git add .
git commit -m "chore: resolve merge conflicts"

# Push
git push origin feat/your-feature
```

---

## 📋 Commit Message Guidelines

### Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Examples

✅ **Feature:**
```
feat(auth): add two-factor authentication

Added SMS-based 2FA using Twilio API.
- Implement OTP generation
- Add verification endpoint
- Update user model

Closes #123
```

✅ **Fix:**
```
fix(cart): resolve total calculation error

The subtotal was not accounting for tax.
Now correctly applies tax to final total.

Fixes #456
```

✅ **Documentation:**
```
docs: update deployment guide

Added instructions for Docker deployment
and AWS RDS setup.
```

---

## 🔄 Release & Deployment Strategy

### Release Process

1. **Feature → main via PR**
   - Create feature branch
   - Open PR with detailed description
   - Pass all CI/CD checks
   - Get code review
   - Merge to main

2. **Tag Release (optional)**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

3. **Deploy (manual or automatic)**
   - Set up GitHub Actions deployment job
   - Or deploy manually to server

### Version Numbering (Semantic Versioning)

- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

---

## 📚 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitHub Workflows](https://docs.github.com/en/actions/workflows)
- [Semantic Versioning](https://semver.org/)

---

## 🎯 Quick Commands

```bash
# View all remotes
git remote -v

# Add remote (if needed)
git remote add origin git@github.com:vismaya2802/SaaS.git

# Verify SSH
ssh -T git@github.com

# Push all branches
git push -u origin --all

# Push all tags
git push -u origin --tags

# View remote info
git remote show origin

# Pull with rebase (cleaner history)
git pull --rebase origin main
```

---

**Last Updated:** August 31, 2026  
**Repository:** vismaya2802/SaaS  
**Status:** ✅ Production Ready

