# Push Code to GitHub from PowerShell

This guide helps you push your staged changes to GitHub using PowerShell.

---

## Prerequisites

✓ Git v2.55.0 installed  
✓ SSH key added to GitHub (https://github.com/settings/keys)  
✓ Changes staged: `git add .`  
✓ Commit created: `git commit -m "chore: ..."`  

---

## Method 1: Direct SSH Push (Recommended)

### Step 1: Open PowerShell

**Important:** Close and reopen PowerShell to get fresh PATH variables. This is the most common reason for "git not found" errors.

### Step 2: Navigate to project

```powershell
cd "c:\Users\Vismaya Nair\Downloads\Vismaya College Project\Vismaya College Project\lenskart-saas"
```

### Step 3: Verify Git is available

```powershell
git --version
```

Should output: `git version 2.55.0.windows.3` (or similar)

### Step 4: Check status

```powershell
git status
```

Should show:
```
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)
```

### Step 5: Push to GitHub

```powershell
git push origin main
```

### First Time Only: Accept Host Key

You may see:
```
The authenticity of host 'github.com (20.207.73.82)' can't be established.
ED25519 key fingerprint is: SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

**Type:** `yes` and press Enter

### Success

You should see:
```
Enumerating objects: 12, done.
Counting objects: 100% (12/12), done.
Delta compression using up to 8 threads
Compressing objects: 100% (8/8), done.
Writing objects: 100% (8/8), 1.23 MiB | 2.45 MiB/s, done.
Total 8 (delta 3), reused 0 (delta 0)
remote: Resolving deltas: 100% (3/3), done.
To github.com:vismaya2802/SaaS.git
   a1b2c3d..e4f5g6h  main -> main
```

---

## Method 2: HTTPS Push (If SSH Fails)

### Step 1: Check remote

```powershell
git remote -v
```

### Step 2: Switch to HTTPS

```powershell
git remote set-url origin https://github.com/vismaya2802/SaaS.git
```

### Step 3: Push

```powershell
git push origin main
```

### Step 4: Enter credentials

When prompted:
- **Username:** `vismaya2802`
- **Password:** Use your GitHub personal access token

**Get token:** https://github.com/settings/tokens

---

## Method 3: Scripted Push

Save this as `push.ps1`:

```powershell
# push.ps1 - Simple GitHub push script

$projectPath = "c:\Users\Vismaya Nair\Downloads\Vismaya College Project\Vismaya College Project\lenskart-saas"

cd $projectPath

Write-Host "📊 Git Status"
git status

Write-Host "`n📝 Commit History (last 5)"
git log --oneline -5

Write-Host "`n📤 Pushing to GitHub..."
git push origin main -v

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Push successful!"
    Write-Host "View at: https://github.com/vismaya2802/SaaS/commits/main"
} else {
    Write-Host "`n❌ Push failed. Check errors above."
}
```

Run it:
```powershell
.\push.ps1
```

---

## Troubleshooting

### Error: "git: command not found"

**Problem:** PowerShell needs to refresh PATH

**Solution:**
```powershell
# Close PowerShell completely and reopen it
# OR refresh PATH with:
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
git --version
```

### Error: "Permission denied (publickey)"

**Problem:** SSH key not configured correctly

**Solution:**
1. Verify SSH key added to GitHub: https://github.com/settings/keys
2. Test SSH: `ssh -T git@github.com`
3. If fails, use HTTPS method instead

### Error: "Host key verification failed"

**Problem:** First SSH connection to GitHub needs key acceptance

**Solution:**
```powershell
# Add GitHub to known hosts
ssh-keyscan github.com | Add-Content $env:USERPROFILE\.ssh\known_hosts

# Try push again
git push origin main
```

### Error: "Your branch is behind 'origin/main'"

**Problem:** Remote has newer commits

**Solution:**
```powershell
# Pull latest changes first
git pull origin main

# Then push
git push origin main
```

### Error: "Commit message does not follow conventional format"

**Problem:** Hook rejected commit message

**Solution:**
```powershell
# Amend commit with correct format
git commit --amend -m "type(scope): description"

# Examples:
# git commit --amend -m "feat(auth): add OTP validation"
# git commit --amend -m "fix(cart): resolve price bug"
# git commit --amend -m "docs: update setup guide"
```

---

## Verification

### On GitHub (After Push)

1. Go to: https://github.com/vismaya2802/SaaS
2. Click "Commits" tab
3. Your new commit should appear at the top
4. Check "Actions" tab for CI/CD status

### In PowerShell

```powershell
# View what was pushed
git log --oneline -5

# Verify branch is up to date
git status
# Should show: "Your branch is up to date with 'origin/main'."

# View remote info
git remote -v
# Should show: git@github.com:vismaya2802/SaaS.git
```

---

## Complete Workflow Example

```powershell
# 1. Open PowerShell (fresh)

# 2. Navigate
cd "c:\Users\Vismaya Nair\Downloads\Vismaya College Project\Vismaya College Project\lenskart-saas"

# 3. Check status
git status

# 4. Stage changes
git add .

# 5. Commit
git commit -m "feat(products): add search functionality"

# 6. Pull latest
git pull origin main

# 7. Push
git push origin main

# 8. Verify
git status
# Output: "Your branch is up to date with 'origin/main'."

# 9. Check GitHub
# https://github.com/vismaya2802/SaaS/commits/main
```

---

## Important Notes

- **PowerShell Fresh Start:** Always close and reopen PowerShell after installing Git
- **SSH Key:** Must be added to GitHub settings before pushing
- **Commit Format:** Follow conventional commits (`type(scope): message`)
- **Host Key:** Accept on first connection to GitHub
- **Pull First:** Always pull before pushing to avoid conflicts

---

## Quick Commands

```powershell
git status                          # View current status
git log --oneline -5               # View recent commits
git push origin main               # Push to GitHub
git pull origin main               # Pull from GitHub
git remote -v                      # View remote URL
ssh -T git@github.com              # Test SSH connection
```

---

**Ready to push?**

```powershell
cd "c:\Users\Vismaya Nair\Downloads\Vismaya College Project\Vismaya College Project\lenskart-saas"
git push origin main
```

