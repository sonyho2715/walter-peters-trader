# BGWealth Deployment Troubleshooting

## Common Deployment Errors & Solutions

### Error: "Cannot find module 'X'"

**Cause:** Missing dependencies

**Solution:**
```bash
# Clean install all dependencies
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json

npm install
cd client && npm install && cd ..
```

### Error: "ECONNREFUSED" or "Cannot connect to database"

**Cause:** PostgreSQL not running or wrong credentials

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it
sudo service postgresql start

# Verify connection with credentials from .env
psql -h localhost -U postgres -d bgwealth_db
```

### Error: "Port 3000 already in use"

**Cause:** Another process using the port

**Solution:**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or change port in .env
echo "PORT=3001" >> .env
```

### Error: TypeScript compilation errors

**Cause:** Missing type definitions or TypeScript config issues

**Solution:**
```bash
# Install missing type definitions
cd server
npm install --save-dev @types/node @types/express @types/cors

cd ../client
npm install --save-dev @types/react @types/react-dom
```

### Error: "Module not found: Can't resolve 'X'" (Vite/React)

**Cause:** Missing client dependencies

**Solution:**
```bash
cd client
npm install react react-dom react-router-dom axios recharts
npm install @tanstack/react-query zustand react-hook-form zod
npm install --save-dev vite @vitejs/plugin-react
```

### Error: Tailwind CSS not working

**Cause:** Missing Tailwind configuration

**Solution:**
```bash
cd client
npm install -D tailwindcss postcss autoprefixer
# Files already created: tailwind.config.js, postcss.config.js
```

### Error: "JWT_SECRET is not defined"

**Cause:** Environment variables not loaded

**Solution:**
```bash
# Ensure .env exists in root directory
cp .env.example .env

# Edit .env and set:
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
```

### Error: Database schema errors

**Cause:** Schema not properly loaded or PostgreSQL version incompatible

**Solution:**
```bash
# Drop and recreate database
dropdb bgwealth_db
createdb bgwealth_db
psql -d bgwealth_db -f server/database/schema.sql

# Or if you get UUID errors:
psql -d bgwealth_db -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
```

## Quick Diagnostic Commands

### Check Installation
```bash
# Check Node version (need 18+)
node -v

# Check npm version
npm -v

# Check if PostgreSQL is accessible
psql --version
pg_isready
```

### Test Backend
```bash
# Start backend only
npm run server:dev

# In another terminal, test health endpoint
curl http://localhost:3000/health
```

### Test Frontend
```bash
# Start frontend only
npm run client:dev

# Visit http://localhost:5173 in browser
```

### Check Database
```bash
# Connect to database
psql -U postgres -d bgwealth_db

# List tables (should show: users, members, studies, etc.)
\dt

# Check if UUID extension is loaded
\dx

# Exit psql
\q
```

## Step-by-Step Fresh Install

If all else fails, here's a complete fresh installation:

```bash
# 1. Clean everything
rm -rf node_modules client/node_modules
rm -f package-lock.json client/package-lock.json

# 2. Install dependencies
npm install
cd client && npm install && cd ..

# 3. Setup environment
cp .env.example .env
# Edit .env with your settings

# 4. Setup database
dropdb bgwealth_db 2>/dev/null || true
createdb bgwealth_db
psql -d bgwealth_db -f server/database/schema.sql

# 5. Start development
npm run dev
```

## Environment Variables Checklist

Ensure your `.env` file has:

```env
# Required
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bgwealth_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=long-random-secret-at-least-32-characters

# Optional but recommended
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Build Errors

### Error during `npm run build`

```bash
# Build server
npm run build:server

# If that works, build client
npm run build:client

# Check for specific errors in each step
```

## Still Having Issues?

1. **Check the exact error message** - Copy the full error output
2. **Check logs** - Look in terminal for stack traces
3. **Verify file permissions** - Ensure all files are readable
4. **Check Node version** - Must be 18 or higher
5. **Check PostgreSQL version** - Must be 12 or higher

## Run Automated Setup

Use the provided setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This will check prerequisites and guide you through setup.
