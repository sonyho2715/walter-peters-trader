#!/bin/bash

# BGWealth Deployment Setup Script
# This script helps set up and troubleshoot the deployment

set -e  # Exit on error

echo "================================================"
echo "BGWealth Deployment Setup"
echo "================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
echo "Step 1: Checking Prerequisites..."
echo "-----------------------------------"

if command_exists node; then
    NODE_VERSION=$(node -v)
    print_status "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_status "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed."
    exit 1
fi

if command_exists psql; then
    PSQL_VERSION=$(psql --version)
    print_status "PostgreSQL is installed: $PSQL_VERSION"
else
    print_warning "PostgreSQL client not found. You'll need it for database setup."
fi

echo ""

# Check if .env exists
echo "Step 2: Checking Configuration..."
echo "-----------------------------------"

if [ -f ".env" ]; then
    print_status ".env file exists"
else
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_status "Created .env file from .env.example"
        echo ""
        print_warning "IMPORTANT: Edit .env and configure your database credentials and JWT secret!"
        echo ""
    else
        print_error ".env.example not found"
    fi
fi

echo ""

# Install dependencies
echo "Step 3: Installing Dependencies..."
echo "-----------------------------------"

echo "Installing root dependencies..."
if npm install; then
    print_status "Root dependencies installed"
else
    print_error "Failed to install root dependencies"
    exit 1
fi

echo ""
echo "Installing client dependencies..."
cd client
if npm install; then
    print_status "Client dependencies installed"
else
    print_error "Failed to install client dependencies"
    exit 1
fi
cd ..

echo ""

# Database check
echo "Step 4: Database Setup (Optional)..."
echo "-----------------------------------"

if command_exists psql; then
    echo "Would you like to set up the database now? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        echo "Enter database name (default: bgwealth_db):"
        read -r dbname
        dbname=${dbname:-bgwealth_db}

        echo "Creating database..."
        if createdb "$dbname" 2>/dev/null; then
            print_status "Database created: $dbname"
        else
            print_warning "Database may already exist or creation failed"
        fi

        echo "Running schema..."
        if psql -d "$dbname" -f server/database/schema.sql; then
            print_status "Database schema created"
        else
            print_error "Failed to create schema"
        fi
    fi
else
    print_warning "Skipping database setup (psql not found)"
fi

echo ""

# Summary
echo "================================================"
echo "Setup Complete!"
echo "================================================"
echo ""
echo "Next Steps:"
echo "1. Edit .env file with your configuration"
echo "2. Ensure PostgreSQL database is set up"
echo "3. Run: npm run dev"
echo ""
echo "Troubleshooting:"
echo "- Backend will run on: http://localhost:3000"
echo "- Frontend will run on: http://localhost:5173"
echo "- Check logs for any errors"
echo ""
echo "For detailed setup instructions, see SETUP.md"
echo ""
