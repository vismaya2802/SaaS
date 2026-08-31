# ⚙️ STEP 2: Verify & Fix Vercel Settings

Your code is on GitHub. Now let's make sure Vercel is configured correctly to deploy it.

---

## 🎯 What This Step Does

Ensures Vercel knows how to deploy your monorepo (frontend + backend together).

**Time:** ~5 minutes

---

## ✅ Step-by-Step Instructions

### Step 1: Go to Vercel Dashboard

Open this URL:
```
https://vercel.com/dashboard/saasvf
```

You should see your Vercel project dashboard.

---

### Step 2: Access Settings

1. **Look for "Settings" link** (usually at top or in menu)
2. **Click "Settings"**

You should see project settings page.

---

### Step 3: Check Build & Development Settings

1. **Find "Build & Development Settings" section**
2. **Verify these values:**

| Setting | Current Value | Should Be | Status |
|---------|---------------|-----------|--------|
| Root Directory | (check what's shown) | `.` | ✅ or ⚠️ |
| Build Command | (check what's shown) | (empty) | ✅ or ⚠️ |
| Install Command | (check what's shown) | (empty) | ✅ or ⚠️ |
| Output Directory | (check what's shown) | (empty) | ✅ or ⚠️ |

**What should happen:**
- Root Directory shows: `.` (just a dot)
- Others should be empty or say "None"

**If different:**
1. Click the edit icon (pencil) next to each field
2. Change to the values above
3. Save

---

### Step 4: Check Environment Variables

1. **Scroll down to "Environment Variables" section**
2. **Look for these variables:**

**Variable 1:**
```
Key: VITE_API_URL
Value: https://saasvf.vercel.app/api
```

**Variable 2:**
```
Key: PYTHONUNBUFFERED
Value: 1
```

**If not present:**
1. Click "+ Add More"
2. Enter the missing variable
3. Click "Add"

**If wrong values:**
1. Click the X to delete the variable
2. Add it again with correct value

---

### Step 5: Save Settings

1. **Scroll to bottom of page**
2. **Click "Save"** button
3. **Wait for confirmation** (usually says "Saved")

---

### Step 6: Go Back to Main Project Page

1. **Click "Dashboard"** or back arrow
2. **You should see the main project page again**

---

### Step 7: Check for Deploy Button

1. **Look for "Deploy" button** (usually bottom right)
2. **Button should be highlighted/clickable** (not greyed out)

**If Deploy button appears:** ✅ Ready for Step 3!  
**If Deploy button missing/greyed out:** See troubleshooting below

---

## 🔧 Troubleshooting

### Issue 1: Deploy Button Still Not Appearing

**Solution A: Clear Browser Cache**
```
Press: Ctrl+Shift+Delete
Select: Cookies and cached files
Click: Clear
Then refresh page (F5)
```

**Solution B: Try Different Browser**
- Try: Chrome, Edge, Firefox, or Safari
- Or try: Mobile browser (phone)

**Solution C: Try Incognito Window**
```
Press: Ctrl+Shift+N (Windows)
Go to: https://vercel.com/dashboard/saasvf
```

**Solution D: Disconnect and Reconnect Repository**
1. Go to: https://vercel.com/dashboard/saasvf
2. Click "Settings"
3. Find "Git Repository" section
4. Click "Disconnect"
5. Go to: https://vercel.com/new
6. Import GitHub repository again
7. Vercel will auto-detect settings from vercel.json

---

### Issue 2: Settings Won't Save

**Try:**
1. Refresh the page (F5)
2. Try again
3. If still fails, try different browser

---

### Issue 3: Environment Variables Not Showing

**Check:**
1. Scroll down slowly - might be below fold
2. Look for "Environment Variables" heading
3. If still not there, wait 1-2 minutes and refresh
4. Vercel sometimes takes time to load all sections

---

## 📋 Verification Checklist

Before clicking Deploy, verify:

- [ ] Root Directory: `.`
- [ ] Build Command: empty
- [ ] Install Command: empty
- [ ] Output Directory: empty
- [ ] VITE_API_URL: `https://saasvf.vercel.app/api`
- [ ] PYTHONUNBUFFERED: `1`
- [ ] All settings saved (see confirmation message)
- [ ] Deploy button visible and clickable

---

## 🎯 Next Step: Deploy!

Once all settings are verified:

1. **Click "Deploy" button**
2. **Vercel will start building**
3. **Both frontend and backend build together**
4. **Takes 5-10 minutes**

**Status page shows:**
- Building frontend...
- Building backend...
- Deploying services...
- Deployment complete ✅

---

## ✨ After Settings Are Fixed

Your Vercel project is now configured to:
- ✅ Auto-detect monorepo (frontend + backend)
- ✅ Build frontend with Vite
- ✅ Build backend with Python 3.11
- ✅ Deploy both services to same project
- ✅ Route /api/* to backend
- ✅ Route /* to frontend

---

## 📞 Having Issues?

**Settings won't save?** → Try different browser  
**Deploy button missing?** → See Troubleshooting section  
**Need more details?** → See VERCEL_SETUP_FIX.md  

---

## 🚀 You're Almost There!

```
STEP 1: Push to GitHub          ✅ Complete
STEP 2: Fix Vercel Settings     ⏳ YOU ARE HERE
STEP 3: Click Deploy            ⏳ Next
────────────────────────────────────────
Your SaaS goes LIVE in ~5 minutes!
```

---

**Next:** Click "Deploy" button and wait ~10 minutes  
**Then:** Visit https://saasvf.vercel.app to see your live SaaS! 🎉

