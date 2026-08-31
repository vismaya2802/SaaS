# 🚀 Git & GitHub Workflow Guide

## Overview

This guide explains the Git workflow for the VisionFrame SaaS project, including commit conventions, hooks, and GitHub workflows.

---

## 📋 Conventional Commits Format

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]
[optional footer]
```

### Commit Types

| Type | Description | Example |
|------|-------------|---------|
| **feat** | New feature | `feat(auth): add OTP login` |
| **fix** | Bug fix | `fix(cart): resolve total calculation` |
| **docs** | Documentation | `docs: update API endpoints` |
| **style** | Code style (no logic change) | `style(ui): format navbar component` |
| **refactor** | Code refactor | `refactor(db): simplify queries` |
| **perf** | Performance improvement | `perf(api): optimize product filtering` |
| **test** | Add/update tests | `test(auth): add OTP validation tests` |
| **chore** | Maintenance | `chore: update dependencies` |

### Examples

✅ **Good commits:**
```bash
git commit -m "feat(products): add search functionality"
git commit -m "fix(payment): resolve Razorpay integration error"
git commit -m "docs(readme): update setup instructions"
git commit -m "refactor(components): extract header to separate file"
```

❌ **Bad commits:**
```bash
git commit -m "fixed stuff"
git commit -m "update"
git commit -m "WIP"
```

---

## 🔗 Git Hooks

Hooks are automatically configured in `.git/hooks/`:

### Pre-Commit Hook (`pre-commit`)
**Runs before committing changes**
- ✓ Validates Python syntax
- ✓ Checks JavaScript files
- ✓ Prevents commits with syntax errors

### Commit-Msg Hook (`commit-msg`)
**Validates commit message format**
- ✓ Enforces conventional commits
- ✓ Rejects non-compliant messages
- ✓ Shows format hints on failure

### Post-Commit Hook (`post-commit`)
**Runs after successful commit** (optional)
- ✓ Can run tests automatically
- ✓ Generate changelogs
- ✓ Triggered by: `BUILD_TESTS=1 git commit -m "..."`

### Kiro Hooks

Three Kiro hooks are configured:

1. **Lint Python on Save** (`.kiro/hooks/lint-python-on-save.json`)
   - Validates Python syntax when you save `.py` files
   - Prevents broken code from being committed

2. **Validate Commit Messages** (`.kiro/hooks/commit-msg-validation.json`)
   - Reminds you about conventional commit format
   - Triggered on user prompt submission

3. **Pre-Push Verification** (`.kiro/hooks/pre-push-checks.json`)
   - Reminds you to pull latest changes before pushing
   - Suggests verification steps

---

## 📤 Pushing to GitHub

### SSH Authentication (Already Configured)

Your repository uses SSH key-based authentication:
```
Remote: git@github-vismaya:vismaya2802/SaaS.git
```

### Basic Workflow

```bash
# 1. Make changes and stage them
git add .

# 2. Commit with conventional format
git commit -m "feat(auth): add password reset functionality"

# 3. Pull latest changes from origin
git pull origin main

# 4. Push to GitHub
git push origin main

# 5. View the commit on GitHub
# https://github.com/vismaya2802/SaaS/commits/main
```

### Step-by-Step Examples

**Feature Development:**
```bash
# Create a new branch for your feature
git checkout -b feat/ar-try-on-improvements

# Make changes
# ... edit files ...

# Stage and commit
git add frontend/src/components/ARView.jsx
git commit -m "feat(ar): add scale adjustment slider"

# Push to GitHub
git push origin feat/ar-try-on-improvements

# Create a Pull Request on GitHub
```

**Bug Fix:**
```bash
# Create a fix branch
git checkout -b fix/cart-calculation

# Make changes
# ... edit files ...

# Commit with fix type
git add backend/app/routers/cart.py
git commit -m "fix(cart): resolve total price calculation bug"

# Push and create PR
git push origin fix/cart-calculation
```

**Hotfix (urgent production fix):**
```bash
# Start from main
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/payment-timeout

# Make the fix
# ... edit files ...

# Commit
git add backend/app/routers/payment.py
git commit -m "fix(payment): increase request timeout to 30s"

# Push and merge to main ASAP
git push origin hotfix/payment-timeout
```

---

## ✅ Pre-Push Checklist

Before running `git push`, verify:

- [ ] **Tests pass**: Backend and frontend tests successful
- [ ] **Code quality**: No syntax errors or obvious issues
- [ ] **Commit messages**: Follow conventional format
- [ ] **Branch is up-to-date**: Run `git pull origin main`
- [ ] **No conflicts**: Merge conflicts resolved
- [ ] **Target branch correct**: Pushing to `main` or feature branch?

### Quick Verification Commands

```bash
# Check status
git status

# View commits to be pushed
git log origin/main..HEAD

# View staged changes
git diff --cached

# Verify syntax
cd backend && python -m py_compile app/main.py
cd frontend && npm run build 2>&1 | head -20

# Pull before push
git pull origin main

# Push
git push origin main
```

---

## 🔄 GitHub Workflow

### Repository Settings

**Current Setup:**
- Repository: `vismaya2802/SaaS`
- Remote URL: `git@github-vismaya:vismaya2802/SaaS.git`
- Authentication: SSH keys
- Default branch: `main`

### Branches

```
main/
├── production-ready code
└── all commits have been tested

feature/ar-enhancements/
├── WIP: new AR features
└── merged to main after review

fix/payment-gateway/
├── bug fix for payment
└── merged to main after testing
```

### Commit History Example

```
* a7d9f2c (HEAD -> main) feat(telemetry): add real-time analytics streaming
* b4e8c1d fix(ui): resolve mobile responsive issues
* c2f5a9e docs(api): add payment endpoint documentation
* d6g3h7j feat(products): implement advanced filtering
* e9i2k5l chore: update dependencies to latest versions
```

---

## 🛠️ Common Commands

```bash
# View Git configuration
git config --global --list
git config --local --list

# Set Git user (if needed)
git config user.name "Your Name"
git config user.email "your@email.com"

# Stage specific files
git add backend/app/main.py
git add frontend/src/components/Navbar.jsx

# Stage all changes
git add .

# Commit
git commit -m "type(scope): description"

# Amend last commit (before push!)
git commit --amend -m "new message"

# View commit history
git log --oneline -10
git log --graph --oneline --all

# View what will be pushed
git log origin/main..HEAD

# Pull latest changes
git pull origin main

# Push to GitHub
git push origin main

# Push specific branch
git push origin feat/my-feature

# Delete local branch
git branch -d feat/old-feature

# Delete remote branch
git push origin --delete feat/old-feature

# Check remote
git remote -v
```

---

## 🚨 Troubleshooting

### "Permission denied (publickey)" Error

**Problem:** SSH key not recognized by GitHub

**Solution:**
```bash
# Test SSH connection
ssh -T git@github.com

# If fails, verify SSH key is added to GitHub:
# https://github.com/settings/keys
```

### Commit Message Hook Rejection

**Problem:** Commit message doesn't follow format

**Example error:**
```
❌ Commit message does not follow conventional commits format
Format: type(scope): description
Example: feat(auth): add OTP login validation
```

**Solution:**
```bash
# Recommit with correct format
git commit -m "feat(auth): add OTP login validation"
```

### Pre-Commit Hook Failure

**Problem:** Python syntax error detected

**Solution:**
```bash
# Fix the syntax error in the file
# Then retry
git commit -m "fix(backend): resolve syntax error"
```

### Merge Conflicts

**Problem:** Local changes conflict with remote

**Solution:**
```bash
# Pull and resolve conflicts
git pull origin main

# Edit conflicted files (marked with <<<<<<, ======, >>>>>>>)
# Then stage and commit
git add .
git commit -m "chore: resolve merge conflicts"

# Push
git push origin main
```

---

## 📊 GitHub Statistics

Track your contributions:
- **Commits**: `https://github.com/vismaya2802/SaaS/commits/main`
- **Pull Requests**: `https://github.com/vismaya2802/SaaS/pulls`
- **Issues**: `https://github.com/vismaya2802/SaaS/issues`
- **Network**: `https://github.com/vismaya2802/SaaS/network`

---

## 📚 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub SSH Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [Git Hooks Guide](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

---

## ✨ Quick Reference

```bash
# Daily workflow
git pull origin main                    # Get latest
git add .                              # Stage changes
git commit -m "type(scope): message"   # Commit
git push origin main                   # Push to GitHub

# Feature branch workflow
git checkout -b feat/feature-name      # Create branch
# ... make changes ...
git add .
git commit -m "feat(scope): description"
git push origin feat/feature-name      # Push feature branch
# Create PR on GitHub
```

---

**Version:** 1.0  
**Last Updated:** August 31, 2026  
**Repository:** vismaya2802/SaaS

