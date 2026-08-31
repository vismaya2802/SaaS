# 🎯 EXACT STEPS: Find Root Directory in Vercel Dashboard

## Step-by-Step with Visual Cues

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. You'll see a list of your projects

### Step 2: Click Your Project
1. Find **visionframe-app** (or whatever your project is named)
2. Click on the project name (not the URL, click the actual project card/name)

### Step 3: Find Settings Tab
1. At the TOP of the page, you'll see tabs:
   - Overview
   - Deployments
   - Analytics
   - **Settings** ← CLICK THIS ONE
   - Integrations

### Step 4: Click General in Sidebar
1. On the LEFT side, you'll see a menu:
   - General ← CLICK THIS ONE (should already be selected)
   - Domains
   - Environment Variables
   - Git
   - etc.

### Step 5: Scroll Down to "Build & Development Settings"
1. Scroll down the page
2. You'll see several sections:
   - Project Name
   - Framework Preset
   - **Build & Development Settings** ← THIS IS THE SECTION YOU NEED
   
3. In this section, you'll see:
   - Root Directory (has a text field and an "Edit" button)
   - Framework Preset
   - Build Command
   - Output Directory
   - Install Command

### Step 6: Edit Root Directory
1. Find the **Root Directory** row
2. It currently shows: "./" or is empty
3. Click the **"Edit"** button next to it (looks like a pencil icon)
4. A text field will appear
5. Type: **frontend**
6. Check the box below it that says:
   ☑️ "Include source files outside of the Root Directory in the Build Step"

### Step 7: Update Other Settings (While You're Here)

Make sure these are set:

`
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
`

Click "Edit" on each one if they're not correct.

### Step 8: Save
1. After editing Root Directory, click **"Save"** button
2. A confirmation will appear

### Step 9: Redeploy
1. Click **"Deployments"** tab at the top
2. Find the most recent deployment
3. Click the **three dots (⋯)** on the right side
4. Click **"Redeploy"**
5. Confirm by clicking **"Redeploy"** again

---

## 🖼️ What You're Looking For

**The "Root Directory" field looks like this:**

`
┌─────────────────────────────────────────────────┐
│ Root Directory                          [Edit]  │
│ ./                                              │
│                                                 │
│ ☐ Include source files outside of the Root     │
│   Directory in the Build Step                   │
└─────────────────────────────────────────────────┘
`

**After you click Edit, it changes to:**

`
┌─────────────────────────────────────────────────┐
│ Root Directory                    [Save] [Cancel]│
│ [frontend____________________________]          │
│                                                 │
│ ☑ Include source files outside of the Root     │
│   Directory in the Build Step                   │
└─────────────────────────────────────────────────┘
`

---

## 📍 If You Still Can't Find It

### Alternative Method: Use Project Settings URL

1. Go directly to this URL (replace YOUR-USERNAME and YOUR-PROJECT):
   `
   https://vercel.com/YOUR-USERNAME/visionframe-app/settings
   `

2. Or from your project page, add **/settings** to the end of the URL

3. The Root Directory setting is in the **first section** you see

---

## 🆘 Can't Find "Edit" Button?

If you see the settings but can't edit them:

1. **Check your permissions**: You must be the project owner or have edit access
2. **Try a different browser**: Sometimes cache issues prevent buttons from showing
3. **Refresh the page**: Press Ctrl+R (Windows) or Cmd+R (Mac)

---

## ✅ After You Find It

1. Change **Root Directory** to: rontend
2. Check the box: ☑️ Include source files...
3. Click **Save**
4. Go to **Deployments** tab → Click ⋯ → **Redeploy**

---

## 🎉 Success Check

After redeploy completes (1-2 minutes):
- Visit: https://visionframe-app.vercel.app
- You should see your homepage (no 404 error)

---

## Need More Help?

If you STILL can't find it:
1. Take a screenshot of your Vercel project page
2. Or tell me what you see when you click Settings
3. I'll guide you from there!

The Root Directory setting is definitely there - it's in every Vercel project! 😊
