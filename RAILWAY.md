# Railway Deployment Guide for BGWealth Backend

This guide will walk you through deploying the BGWealth backend API to Railway in **under 10 minutes**.

## 🚀 Quick Deploy (5-10 minutes)

### Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway to access your GitHub account
4. ✅ You're logged in!

---

### Step 2: Deploy from GitHub

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. You'll see a list of your repositories
4. Find and click **"sonyho2715/BGWealth"**
5. Railway will start analyzing your repository

**What Railway detects:**
- ✅ Node.js project
- ✅ package.json found
- ✅ Railway.json configuration

---

### Step 3: Add PostgreSQL Database

Railway will show your new service. Now add a database:

1. In your project, click **"+ New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway provisions the database automatically (takes ~30 seconds)

**You'll see:**
- A new "Postgres" service appear in your project
- Connection details are auto-configured

---

### Step 4: Configure Environment Variables

1. Click on your **BGWealth service** (not the database)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add these:

**Required Variables:**

```bash
NODE_ENV=production

# JWT Secret (IMPORTANT: Use a random string, min 32 characters)
JWT_SECRET=change-this-to-a-secure-random-string-minimum-32-characters

# CORS Origin (Your Vercel frontend URL)
CORS_ORIGIN=https://your-app.vercel.app
```

**Database Variables (Auto-configured by Railway):**
These are automatically set when you add PostgreSQL:
- ✅ `DATABASE_URL` - Auto-generated
- ✅ `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` - All auto-set

**Optional but Recommended:**
```bash
PORT=3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

### Step 5: Update Database Configuration

Railway uses `DATABASE_URL`, but our code uses individual variables. Let's fix this:

**Option A: Add Individual Variables (Recommended)**

In the Variables tab, add these by copying from Postgres service:

1. Click on **"Postgres"** service
2. Go to **"Variables"** tab
3. Copy these values:
   - `PGHOST` → Add to BGWealth service as `DB_HOST`
   - `PGPORT` → Add to BGWealth service as `DB_PORT`
   - `PGDATABASE` → Add to BGWealth service as `DB_NAME`
   - `PGUSER` → Add to BGWealth service as `DB_USER`
   - `PGPASSWORD` → Add to BGWealth service as `DB_PASSWORD`

**Option B: Use DATABASE_URL (Quick way)**

Railway auto-sets `DATABASE_URL`. The code will need a small update (I can do this if needed).

---

### Step 6: Deploy

1. Railway **automatically deploys** when you push to GitHub
2. Check the **"Deployments"** tab to watch progress
3. You'll see:
   ```
   ⏳ Building...
   ✅ Build successful
   ⏳ Deploying...
   ✅ Deployment successful
   ```

**Build time:** ~2-3 minutes

---

### Step 7: Run Database Migration

Once deployed, you need to create the database tables:

1. Click on your **BGWealth service**
2. Go to **"Settings"** tab
3. Scroll down to **"Networking"**
4. Copy your **"Public Domain"** (e.g., `bgwealth.up.railway.app`)
5. Go back to the service
6. Click **"Command"** or **"Terminal"** (if available)

**Run this command:**
```bash
psql $DATABASE_URL -f server/database/schema.sql
```

**Alternative (if terminal not available):**

Use Railway CLI (install once):
```bash
# On your local machine
npm install -g @railway/cli
railway login
railway link  # Select your project
railway run psql $DATABASE_URL -f server/database/schema.sql
```

---

### Step 8: Verify Deployment

**Test the health endpoint:**

Open in browser:
```
https://your-app.up.railway.app/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "BGWealth API is running",
  "timestamp": "2025-...",
  "version": "v1"
}
```

✅ If you see this, your backend is live!

---

### Step 9: Connect to Vercel Frontend

Now connect your Vercel frontend to the Railway backend:

1. Go to **Vercel Dashboard**
2. Select your BGWealth project
3. Go to **Settings** → **Environment Variables**
4. Add or update:
   ```
   Name: VITE_API_URL
   Value: https://your-app.up.railway.app
   ```
   (Replace with your Railway URL - no trailing slash!)

5. Save
6. Go to **Deployments** tab
7. Click **"Redeploy"** on the latest deployment

**Build time:** ~1-2 minutes

---

### Step 10: Test Everything

Once Vercel redeploys:

1. Visit your **Vercel URL**: `https://your-app.vercel.app`
2. The dashboard should load
3. Try registering a member:
   - Click **"Members"** → **"Register Member"**
   - Fill out the form
   - Submit

✅ **Success!** If the member is registered, your full-stack app is working!

---

## 🎯 Quick Reference

### Your URLs:
- **Frontend (Vercel)**: `https://your-app.vercel.app`
- **Backend (Railway)**: `https://your-app.up.railway.app`
- **API Health Check**: `https://your-app.up.railway.app/health`

### Environment Variables (Railway):

**Required:**
```bash
NODE_ENV=production
JWT_SECRET=your-secure-random-secret-min-32-chars
CORS_ORIGIN=https://your-app.vercel.app
DB_HOST=[from Postgres service]
DB_PORT=[from Postgres service]
DB_NAME=[from Postgres service]
DB_USER=[from Postgres service]
DB_PASSWORD=[from Postgres service]
```

---

## 🐛 Troubleshooting

### Deployment Failed

**Check Logs:**
1. Click on your service
2. Go to **"Deployments"** tab
3. Click on the failed deployment
4. View **"Build Logs"** and **"Deploy Logs"**

**Common Issues:**
- Missing environment variables → Add them in Variables tab
- Build errors → Check if all dependencies are in package.json
- Database connection errors → Verify DB variables are set

### Database Connection Error

**Check:**
1. PostgreSQL service is running (green checkmark)
2. All DB_* variables are set correctly
3. DATABASE_URL is accessible from your service

**Fix:**
```bash
# In Railway terminal
echo $DATABASE_URL
# Should show: postgresql://user:pass@host:port/dbname
```

### CORS Error from Frontend

**Symptom:** Frontend shows network errors

**Fix:**
1. Check `CORS_ORIGIN` in Railway matches your Vercel URL exactly
2. No trailing slash: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`
3. Redeploy Railway after changing

### Migration Failed

**If database tables don't exist:**

```bash
# Using Railway CLI locally
railway login
railway link  # Select your project
railway run bash

# In the Railway shell:
psql $DATABASE_URL -f server/database/schema.sql
exit
```

---

## 🎊 Success Checklist

- [ ] Railway account created
- [ ] BGWealth deployed from GitHub
- [ ] PostgreSQL database added
- [ ] Environment variables configured
- [ ] Deployment successful (green checkmark)
- [ ] Database migration completed
- [ ] Health endpoint returns 200 OK
- [ ] Vercel VITE_API_URL updated
- [ ] Vercel redeployed
- [ ] Frontend loads without errors
- [ ] Can register a new member
- [ ] Dashboard shows data

---

## 💡 Tips

**Free Tier Limits (Railway):**
- $5 free credit per month
- Enough for development/testing
- No credit card required to start

**Upgrading:**
- Add payment method for production use
- Scales automatically with traffic

**Monitoring:**
- Check "Metrics" tab for CPU, Memory, Network usage
- View logs in "Deployments" tab
- Set up alerts in "Settings"

**Database Backups:**
- Railway Pro includes automated backups
- Free tier: manual backups recommended
- Use `pg_dump` for manual backups

---

## 📞 Need Help?

1. Check Railway logs for errors
2. Review TROUBLESHOOTING.md in the repository
3. Verify all environment variables are set
4. Test API endpoints directly with curl/Postman

**Test API directly:**
```bash
# Health check
curl https://your-app.up.railway.app/health

# List members (will be empty initially)
curl https://your-app.up.railway.app/api/v1/members
```

---

## 🚀 Next Steps After Deployment

1. **Test all API endpoints**
2. **Add sample data** through the frontend
3. **Set up monitoring** and alerts
4. **Configure custom domain** (optional)
5. **Enable database backups**
6. **Review security settings**

Your BGWealth application is now fully deployed! 🎉
