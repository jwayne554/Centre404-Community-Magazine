#!/bin/bash

# Start the Centre404 Community Magazine development server
# This script ensures the correct DATABASE_URL is set for PostgreSQL

echo "🚀 Starting Centre404 Community Magazine..."
echo "📦 Using PostgreSQL database at localhost:5432/community_magazine"
echo ""

# Set DATABASE_URL for PostgreSQL
export DATABASE_URL="postgresql://johnny@localhost:5432/community_magazine"

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running. Starting PostgreSQL..."
    brew services start postgresql@17
    echo "⏳ Waiting for PostgreSQL to start..."
    sleep 3
fi

# Start the development server
echo "✅ Starting Next.js development server..."
npm run dev
