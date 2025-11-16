# BG Trader Dashboard - Walter Peters Edition

## User Information

**Name:** Walter Peters
**Referral Code:** A3k16Uam5S00
**Referral Link:** https://dsj927.com/?code=A3k16Uam5S00

## About This Installation

This is a customized instance of the BG Wealth Sharing AI Trading Platform configured specifically for Walter Peters. The platform provides:

- Comprehensive trading tutorials
- Video guides for AI trading
- Progress tracking and analytics
- Multilingual support (English/Vietnamese)
- Interactive onboarding dashboard

## Quick Start

### Prerequisites
- Node.js v24.5.0 or higher
- PostgreSQL database
- npm or yarn package manager

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **Database Setup**
   ```bash
   # Create database for Walter Peters
   createdb bgwealth_walter_db

   # Run schema
   psql -d bgwealth_walter_db -f server/database/schema.sql
   ```

3. **Environment Configuration**
   The `.env.local` file is already configured with Walter's credentials:
   - User Code: A3k16Uam5S00
   - Database: bgwealth_walter_db
   - Custom JWT secret for security

4. **Start the Application**
   ```bash
   # Development mode
   npm run dev

   # Access the application
   # Frontend: http://localhost:5173
   # Backend: http://localhost:3000
   ```

## Deployment

### Vercel Deployment

This project can be deployed to Vercel:

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Environment Variables for Production

When deploying, make sure to set these environment variables:

- `USER_NAME=Walter Peters`
- `USER_CODE=A3k16Uam5S00`
- `REFERRAL_LINK=https://dsj927.com/?code=A3k16Uam5S00`
- `DB_HOST=<your-production-db-host>`
- `DB_NAME=bgwealth_walter_db`
- `DB_USER=<your-db-user>`
- `DB_PASSWORD=<your-db-password>`
- `JWT_SECRET=<generate-strong-secret>`

## Accessing the Dashboard

Once deployed, users can access Walter Peters' dashboard through:

1. **Direct Link:** https://dsj927.com/?code=A3k16Uam5S00
2. **Main Platform:** Navigate to the platform and enter code: A3k16Uam5S00

## Features

- **Member Management**: Track and manage trading participants
- **Study Management**: Organize trading education materials
- **Progress Tracking**: Monitor learning progress and achievements
- **Analytics Dashboard**: View trading metrics and KPIs
- **Document Management**: Secure file uploads and management
- **Communication Logging**: Track all participant interactions

## Security

This installation includes:
- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting
- SQL injection prevention
- XSS protection
- Secure file upload validation

## Support

For technical support or questions about this installation, please refer to:
- [SETUP.md](SETUP.md) - Detailed setup instructions
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guides

## License

MIT

---

**Generated for Walter Peters**
**Code:** A3k16Uam5S00
**Date:** November 15, 2025
