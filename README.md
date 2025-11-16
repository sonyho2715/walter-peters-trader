# BGWealth Control Dashboard

A comprehensive recruitment and member management system for study participants with robust input validation and security features.

## Features

### Core Functionality
- **Member Management**: Register, update, and track recruitment participants
- **Study Management**: Create and manage research studies with eligibility criteria
- **Application Tracking**: Track participant applications through the recruitment funnel
- **Dashboard Analytics**: Real-time metrics, KPIs, and recruitment analytics
- **Document Management**: Secure file uploads with validation
- **Communication Logging**: Track all interactions with participants

### Security & Validation
- **Input Validation**: Multi-layer validation using Zod and express-validator
- **SQL Injection Prevention**: Parameterized queries and input sanitization
- **XSS Protection**: HTML sanitization and output escaping
- **Rate Limiting**: Prevent abuse with configurable rate limits
- **Authentication**: JWT-based authentication with role-based access control
- **Security Headers**: Helmet.js for secure HTTP headers
- **File Upload Validation**: Type, size, and content validation
- **Audit Logging**: Track all system activities

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Validation**: Zod, express-validator
- **Security**: Helmet, bcrypt, JWT
- **Rate Limiting**: express-rate-limit

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Quick Start

See [SETUP.md](SETUP.md) for detailed setup instructions.

```bash
# 1. Install dependencies
npm install
cd client && npm install && cd ..

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# 3. Setup database
createdb bgwealth_db
psql -d bgwealth_db -f server/database/schema.sql

# 4. Start development servers
npm run dev

# 5. Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

## Project Structure

```
BGWealth/
├── server/                      # Backend application
│   ├── config/                  # Configuration files
│   ├── controllers/             # Request handlers
│   ├── middleware/              # Validation, security, file upload
│   ├── routes/                  # API routes
│   ├── database/                # Database schema
│   └── index.ts                 # Server entry point
├── client/                      # Frontend application
│   └── src/
│       ├── components/          # Reusable components
│       ├── pages/               # Page components
│       ├── App.tsx
│       └── main.tsx
├── .env.example                 # Environment variables template
├── package.json
├── README.md
└── SETUP.md                     # Detailed setup guide
```

## API Endpoints

### Base URL: `/api/v1`

**Members**
- `POST /members` - Register member
- `GET /members` - List members
- `GET /members/:id` - Get member
- `PUT /members/:id` - Update member

**Studies**
- `POST /studies` - Create study
- `GET /studies` - List studies
- `GET /studies/:id` - Get study

**Applications**
- `POST /applications` - Submit application
- `GET /applications` - List applications
- `PATCH /applications/:id/status` - Update status

**Dashboard**
- `GET /dashboard/metrics` - Get KPIs
- `GET /dashboard/analytics` - Get analytics
- `GET /dashboard/recruitment-funnel` - Get funnel data

## Input Validation Examples

### Valid Member Registration
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+12345678901",
  "dateOfBirth": "1990-01-15",
  "studyInterest": ["clinical_trial"],
  "consentGiven": true
}
```

### Validation Rules
- **Email**: Valid format, max 100 chars
- **Phone**: E.164 format (+1234567890)
- **Names**: 2-50 chars, letters only
- **Date of Birth**: YYYY-MM-DD, age 18-120
- **ZIP Code**: 5 digits or 5+4 format

## Security Features

1. **Input Validation**: Zod schemas + express-validator
2. **SQL Injection Prevention**: Parameterized queries
3. **XSS Protection**: HTML sanitization
4. **Rate Limiting**: 100 requests per 15 minutes
5. **JWT Authentication**: Secure token-based auth
6. **RBAC**: Role-based access control
7. **Helmet Security**: HTTP security headers
8. **File Upload Security**: Type/size validation

## Development

```bash
npm run dev          # Run both servers
npm run server:dev   # Backend only
npm run client:dev   # Frontend only
npm run build        # Build for production
npm run test         # Run tests
```

## License

MIT
