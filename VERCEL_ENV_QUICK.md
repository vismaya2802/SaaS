# ⚡ QUICK REFERENCE: Vercel Environment Variables

## 📋 Copy-Paste Values (Replace [your-project-name] with actual)

### ✅ 4 REQUIRED VARIABLES

```
Variable Name: VITE_API_URL
Value: https://[your-project-name].vercel.app/api
Environments: ✓ Production  ✓ Preview  ✓ Development
```

```
Variable Name: PYTHONUNBUFFERED
Value: 1
Environments: ✓ Production  ✓ Preview  ✓ Development
```

```
Variable Name: CORS_ORIGINS
Value: https://[your-project-name].vercel.app
Environments: ✓ Production  ✓ Preview  ✓ Development
```

```
Variable Name: DATABASE_URL
Value: sqlite:///tmp/visionframe.db
Environments: ✓ Production  ✓ Preview  ✓ Development
⚠️ Note: For production, use Vercel Postgres or other cloud database
```

---

## 🎯 Example with Project Name "visionframe-saas"

```
VITE_API_URL=https://visionframe-saas.vercel.app/api
PYTHONUNBUFFERED=1
CORS_ORIGINS=https://visionframe-saas.vercel.app
DATABASE_URL=sqlite:///tmp/visionframe.db
```

---

## 🔗 Add Variables: https://vercel.com/[username]/[project]/settings/environment-variables

## 📖 Full Guide: See VERCEL_ENV_VARIABLES.md
