#!/bin/bash
# Database migration script for Railway

set -e

echo "🚀 Starting database migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "📊 Running database schema..."
psql "$DATABASE_URL" -f server/database/schema.sql

echo "✅ Database migration completed successfully!"
echo ""
echo "Database tables created:"
psql "$DATABASE_URL" -c "\dt" 2>/dev/null || echo "Could not list tables"
