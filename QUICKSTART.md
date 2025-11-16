# 🚀 BGWealth Quick Start - Railway Deployment

## ⚡ Deploy Backend in 5 Minutes

### Step 1: Go to Railway (1 min)
```
https://railway.app
```
- Click **"Login with GitHub"**
- Authorize Railway

### Step 2: Deploy Repository (1 min)
- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Choose: **sonyho2715/BGWealth**
- Railway auto-detects and starts building

### Step 3: Add Database (30 sec)
- Click **"+ New"** in your project
- Select **"Database"** → **"Add PostgreSQL"**
- Wait ~30 seconds for provisioning

### Step 4: Add Environment Variables (1 min)
Click on **BGWealth service** → **Variables** tab → Add these:

```bash
NODE_ENV=production
JWT_SECRET=your-random-secret-minimum-32-characters-long-change-this
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

**That's it!** Railway auto-configures DATABASE_URL from the Postgres service.

### Step 5: Run Migration (1 min)
After deployment completes:

**Option A - Using Railway CLI:**
```bash
npm install -g @railway/cli
railway login
railway link
railway run psql $DATABASE_URL -f server/database/schema.sql
```

**Option B - Using Web Terminal:**
1. Click your service → **"Settings"**
2. Find **"Service Domains"** and enable
3. Click **"Deploy"** tab → **"View Logs"**
4. Use Railway's web terminal if available

### Step 6: Get Your API URL
- Click on BGWealth service
- Go to **"Settings"** → **"Networking"**
- Copy **"Public URL"** (e.g., `bgwealth-production.up.railway.app`)

### Step 7: Update Vercel (1 min)
Go to Vercel Dashboard:
- Settings → Environment Variables
- Update `VITE_API_URL` to: `https://your-railway-url.up.railway.app`
- Redeploy

---

## ✅ Test Your Deployment

**Test Backend:**
```
https://your-railway-url.up.railway.app/health
```

Should return:
```json
{
  "success": true,
  "message": "BGWealth API is running"
}
```

**Test Full Stack:**
Visit your Vercel URL and register a member!

---

## 📋 Environment Variables Reference

### Railway (Backend)
```bash
NODE_ENV=production
JWT_SECRET=<32+ character random string>
CORS_ORIGIN=<your-vercel-url>
DATABASE_URL=<auto-set by Railway>
```

### Vercel (Frontend)
```bash
VITE_API_URL=<your-railway-url>
```

---

## 🆘 Troubleshooting

### Database Connection Error
- Check: Postgres service is running (green dot)
- Verify: DATABASE_URL is auto-set in BGWealth service variables

### CORS Error
- Ensure CORS_ORIGIN exactly matches Vercel URL
- No trailing slash: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`

### Migration Failed
```bash
railway run bash
psql $DATABASE_URL -f server/database/schema.sql
exit
```

---

## 📚 Detailed Guides

- **Complete Railway Guide**: See `RAILWAY.md`
- **All Deployment Options**: See `DEPLOYMENT.md`
- **Troubleshooting**: See `TROUBLESHOOTING.md`

---

## 🎯 Your URLs After Deployment

| Service | URL |
|---------|-----|
| Frontend | `https://your-app.vercel.app` |
| Backend API | `https://your-app.up.railway.app` |
| API Health | `https://your-app.up.railway.app/health` |
| Dashboard | `https://your-app.up.railway.app/api/v1/dashboard/metrics` |

---

**Total Time**: ~5-7 minutes ⚡

Your full-stack BGWealth application will be live!
