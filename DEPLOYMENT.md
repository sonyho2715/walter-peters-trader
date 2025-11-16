# BGWealth Deployment Guide

## Architecture

BGWealth is a full-stack application with:
- **Frontend**: React + Vite (client/)
- **Backend**: Express.js API (server/)
- **Database**: PostgreSQL

## Recommended Deployment Strategy

### Option 1: Separate Frontend & Backend (Recommended)

This is the most common and scalable approach:

#### Frontend → Vercel
The frontend (React app) is deployed to Vercel.

#### Backend → Railway/Render/Heroku
The backend (Express API + PostgreSQL) is deployed to a backend platform.

---

## Frontend Deployment (Vercel)

### 1. Vercel Configuration

The repository is already configured for Vercel with:
- `vercel.json` - Build configuration
- `.vercelignore` - Exclude backend files

### 2. Deploy to Vercel

**Via Vercel Dashboard:**
1. Go to https://vercel.com/new
2. Import the GitHub repository: `sonyho2715/BGWealth`
3. Select branch: `claude/validate-input-011CUKTeVemB2xkDHeo6WxiQ`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variable:
   - `VITE_API_URL` = Your backend API URL (see backend deployment below)

6. Click "Deploy"

**Via Vercel CLI:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 3. Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
VITE_API_URL=https://your-backend-url.com
```

---

## Backend Deployment (Railway/Render)

The backend needs to be deployed separately to a platform that supports:
- Node.js
- PostgreSQL database
- Long-running processes

### Option A: Railway (Recommended)

**1. Create Railway Account**
- Go to https://railway.app
- Sign up with GitHub

**2. Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose `sonyho2715/BGWealth`

**3. Configure Service**
- Add PostgreSQL database (Railway will automatically provision)
- Set root directory: `/` (or leave blank)
- Build command: `npm install && npm run build:server`
- Start command: `npm start`

**4. Environment Variables**
Add in Railway dashboard:
```
NODE_ENV=production
PORT=3000
DB_HOST=${{ POSTGRES_HOST }}
DB_PORT=${{ POSTGRES_PORT }}
DB_NAME=${{ POSTGRES_DATABASE }}
DB_USER=${{ POSTGRES_USER }}
DB_PASSWORD=${{ POSTGRES_PASSWORD }}
JWT_SECRET=your-super-secret-key-minimum-32-characters
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

**5. Run Database Migration**
In Railway terminal:
```bash
psql $DATABASE_URL -f server/database/schema.sql
```

### Option B: Render

**1. Create Render Account**
- Go to https://render.com
- Sign up with GitHub

**2. Create PostgreSQL Database**
- New → PostgreSQL
- Name: `bgwealth-db`
- Copy the Internal Database URL

**3. Create Web Service**
- New → Web Service
- Connect repository: `sonyho2715/BGWealth`
- Configure:
  - Name: `bgwealth-api`
  - Environment: `Node`
  - Build Command: `npm install && npm run build:server`
  - Start Command: `npm start`

**4. Environment Variables**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=<internal-database-url>
JWT_SECRET=your-super-secret-key
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

**5. Run Migration**
In Render Shell:
```bash
psql $DATABASE_URL -f server/database/schema.sql
```

---

## Option 2: Full Stack on Railway

Deploy both frontend and backend to Railway:

**1. Deploy Backend** (as above)

**2. Deploy Frontend**
- Create new service
- Build command: `cd client && npm install && npm run build`
- Start command: `npx serve -s client/dist -p $PORT`
- Add environment variable: `VITE_API_URL=https://your-backend-url`

---

## Option 3: Docker Deployment

Use the provided Dockerfile (see below).

### Create Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source
COPY . .

# Build
RUN npm run build:server
RUN npm run build:client

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/database ./server/database

# Install production dependencies only
RUN npm install --production

EXPOSE 3000

CMD ["npm", "start"]
```

**Deploy with Docker:**
```bash
docker build -t bgwealth .
docker run -p 3000:3000 --env-file .env bgwealth
```

---

## Vercel-Only Deployment (Frontend Static)

If you only want to deploy the frontend to Vercel as a static demo:

### Update Client Code

In `client/src/App.tsx` or create `client/src/config.ts`:

```typescript
// Use mock data instead of API calls
export const USE_MOCK_DATA = true;
export const API_URL = import.meta.env.VITE_API_URL || '';
```

Then deploy normally to Vercel.

---

## Post-Deployment Checklist

### Frontend (Vercel)
- [ ] Deployment successful
- [ ] Environment variables set
- [ ] API URL configured
- [ ] CORS working
- [ ] All pages load correctly

### Backend (Railway/Render)
- [ ] Deployment successful
- [ ] Database connected
- [ ] Schema migrations run
- [ ] Environment variables set
- [ ] Health endpoint working: `/health`
- [ ] CORS configured for frontend URL

### Testing
- [ ] Frontend can reach backend API
- [ ] Member registration works
- [ ] Dashboard loads data
- [ ] Authentication works (if implemented)

---

## Monitoring & Logs

### Vercel
- Dashboard → Your Project → Deployments → View Logs

### Railway
- Dashboard → Your Service → Deployments → View Logs

### Render
- Dashboard → Your Service → Logs

---

## Troubleshooting

### "Network Error" / "Failed to Fetch"

**Cause:** Frontend can't reach backend

**Solution:**
1. Verify `VITE_API_URL` is set correctly in Vercel
2. Check CORS settings in backend (should allow your Vercel URL)
3. Ensure backend is deployed and running

### "Database Connection Error"

**Cause:** Backend can't connect to database

**Solution:**
1. Verify all DB_* environment variables are correct
2. Check database is running
3. Run schema migration

### Build Failures on Vercel

**Cause:** Missing dependencies or config

**Solution:**
1. Ensure all `client/` dependencies are listed in `client/package.json`
2. Check build logs for specific errors
3. Verify Node version compatibility (use Node 18+)

---

## Environment Variables Reference

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.railway.app
```

### Backend (Railway/Render)
```
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bgwealth_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
JWT_SECRET=your-jwt-secret-minimum-32-chars
CORS_ORIGIN=https://your-app.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Cost Estimates

### Free Tier Options:
- **Vercel**: Free for personal projects
- **Railway**: $5/month credit (includes PostgreSQL)
- **Render**: Free tier available (limited)
- **Heroku**: No longer offers free tier

### Recommended for Production:
- **Frontend (Vercel)**: Free - $20/month
- **Backend (Railway)**: $5 - $20/month
- **Database**: Included in backend hosting

---

## Need Help?

1. Check logs in your deployment platform
2. Review TROUBLESHOOTING.md
3. Verify all environment variables are set
4. Test API endpoints directly
5. Check CORS configuration
