#!/bin/bash

# BGWealth Railway Deployment Helper
# This script helps you check if everything is ready for Railway deployment

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         BGWealth Railway Deployment Checker                ║"
echo "╔════════════════════════════════════════════════════════════╗"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if required files exist
echo "Checking required files..."
echo "─────────────────────────────────────────────────────────────"

if [ -f "package.json" ]; then
    print_success "package.json exists"
else
    print_error "package.json not found"
    exit 1
fi

if [ -f "railway.json" ]; then
    print_success "railway.json exists"
else
    print_warning "railway.json not found (optional but recommended)"
fi

if [ -f "server/database/schema.sql" ]; then
    print_success "Database schema exists"
else
    print_error "Database schema not found"
    exit 1
fi

echo ""

# Check package.json scripts
echo "Checking package.json scripts..."
echo "─────────────────────────────────────────────────────────────"

if grep -q '"build:server"' package.json; then
    print_success "build:server script exists"
else
    print_error "build:server script missing"
fi

if grep -q '"start"' package.json; then
    print_success "start script exists"
else
    print_error "start script missing"
fi

echo ""

# Display what Railway will do
echo "Railway Deployment Plan:"
echo "─────────────────────────────────────────────────────────────"
print_info "Build command: npm install && npm run build:server"
print_info "Start command: npm start"
print_info "Health check: /health endpoint"
echo ""

# Environment variables needed
echo "Required Environment Variables for Railway:"
echo "─────────────────────────────────────────────────────────────"
echo "NODE_ENV=production"
echo "JWT_SECRET=<your-secret-key-min-32-chars>"
echo "CORS_ORIGIN=<your-vercel-url>"
echo "DB_HOST=<from-postgres-service>"
echo "DB_PORT=<from-postgres-service>"
echo "DB_NAME=<from-postgres-service>"
echo "DB_USER=<from-postgres-service>"
echo "DB_PASSWORD=<from-postgres-service>"
echo ""

# Next steps
echo "Next Steps:"
echo "─────────────────────────────────────────────────────────────"
echo "1. Go to https://railway.app"
echo "2. Login with GitHub"
echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
echo "4. Select this repository: sonyho2715/BGWealth"
echo "5. Add PostgreSQL database"
echo "6. Configure environment variables (see above)"
echo "7. Wait for deployment to complete"
echo "8. Run database migration (see RAILWAY.md)"
echo "9. Update VITE_API_URL in Vercel"
echo ""

echo "For detailed instructions, see: RAILWAY.md"
echo ""

print_success "Pre-deployment check complete!"
echo ""
echo "Ready to deploy to Railway! 🚀"
