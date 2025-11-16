# BGWealth Setup Guide

## Quick Start Guide

### 1. Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure the following required variables:

```env
# Database (Required)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bgwealth_db
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT (Required - change this!)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long

# Server
NODE_ENV=development
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 2. Database Setup

#### Create Database

```bash
# Using psql command line
psql -U postgres

# In psql prompt:
CREATE DATABASE bgwealth_db;
\q
```

#### Run Schema

```bash
psql -U postgres -d bgwealth_db -f server/database/schema.sql
```

#### Verify Setup

```bash
psql -U postgres -d bgwealth_db

# In psql prompt:
\dt  # List all tables
# You should see: users, members, studies, applications, documents, communications, audit_log
```

### 3. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 4. Start Development Servers

```bash
# Option 1: Run both servers concurrently
npm run dev

# Option 2: Run separately
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend
npm run client:dev
```

### 5. Verify Installation

#### Check Backend
Open http://localhost:3000/health

You should see:
```json
{
  "success": true,
  "message": "BGWealth API is running",
  "timestamp": "2025-...",
  "version": "v1"
}
```

#### Check Frontend
Open http://localhost:5173

You should see the BGWealth dashboard interface.

## Testing Input Validation

### Test Member Registration

1. Navigate to http://localhost:5173/members/register

2. Try invalid inputs to test validation:

**Invalid Email:**
```
Email: not-an-email
Expected: "Invalid email format" error
```

**Invalid Phone:**
```
Phone: 123
Expected: "Invalid phone number format" error
```

**Missing Required Field:**
```
Leave First Name empty
Expected: "First name must be at least 2 characters" error
```

**Age Validation:**
```
Date of Birth: 2020-01-01
Expected: "Must be between 18 and 120 years old" error
```

### Test API Directly

#### Valid Request
```bash
curl -X POST http://localhost:3000/api/v1/members \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+12345678901",
    "dateOfBirth": "1990-01-15",
    "studyInterest": ["clinical_trial"],
    "consentGiven": true
  }'
```

#### Invalid Request (SQL Injection Attempt)
```bash
curl -X POST http://localhost:3000/api/v1/members \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe'; DROP TABLE members;--",
    "email": "test@example.com",
    "dateOfBirth": "1990-01-15",
    "studyInterest": ["clinical_trial"],
    "consentGiven": true
  }'
```
Expected: Input should be sanitized/rejected

#### XSS Attempt
```bash
curl -X POST http://localhost:3000/api/v1/members \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "<script>alert(1)</script>",
    "lastName": "Doe",
    "email": "test@example.com",
    "dateOfBirth": "1990-01-15",
    "studyInterest": ["clinical_trial"],
    "consentGiven": true
  }'
```
Expected: Script tags should be stripped

## Common Issues

### Issue: "Cannot connect to database"
**Solution:**
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure database exists: `psql -l | grep bgwealth`

### Issue: "Port 3000 already in use"
**Solution:**
- Change PORT in `.env` file
- Or kill the process: `lsof -ti:3000 | xargs kill`

### Issue: "Module not found"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install

cd client
rm -rf node_modules package-lock.json
npm install
```

### Issue: "CORS error"
**Solution:**
- Check CORS_ORIGIN in `.env` matches your frontend URL
- Default should be: `http://localhost:5173`

## Production Deployment

### 1. Build

```bash
npm run build
cd client && npm run build && cd ..
```

### 2. Environment Variables

Update `.env` for production:
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_PASSWORD=strong-production-password
JWT_SECRET=long-random-production-secret
CORS_ORIGIN=https://your-production-domain.com
```

### 3. Start Production Server

```bash
npm start
```

### 4. Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Update database passwords
- [ ] Configure CORS_ORIGIN to your domain
- [ ] Enable HTTPS
- [ ] Set secure session cookies
- [ ] Review rate limiting settings
- [ ] Enable database backups
- [ ] Set up monitoring and logging

## Database Maintenance

### Backup Database
```bash
pg_dump -U postgres bgwealth_db > backup.sql
```

### Restore Database
```bash
psql -U postgres bgwealth_db < backup.sql
```

### Refresh Dashboard Metrics
```sql
SELECT refresh_dashboard_metrics();
```

## Development Tips

### Watch Logs
```bash
# Backend logs
npm run server:dev

# Database logs
tail -f /var/log/postgresql/postgresql-14-main.log
```

### Reset Database
```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE bgwealth_db;"
psql -U postgres -c "CREATE DATABASE bgwealth_db;"
psql -U postgres -d bgwealth_db -f server/database/schema.sql
```

### Test Rate Limiting
```bash
# Send multiple requests quickly
for i in {1..10}; do
  curl http://localhost:3000/api/v1/members &
done
```

You should see rate limit errors after the configured threshold.

## Next Steps

1. Review the API documentation in README.md
2. Test all validation scenarios
3. Set up user authentication
4. Configure file upload directories
5. Review security settings
6. Set up monitoring
7. Configure backups

## Support

For additional help:
- Check the main README.md
- Review the code comments
- Check the database schema in `server/database/schema.sql`
- Review validation schemas in `server/middleware/validation.ts`
