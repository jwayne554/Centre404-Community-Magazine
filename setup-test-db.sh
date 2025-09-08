#!/bin/bash

echo "🚀 Setting up test database for Community Magazine"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it first:"
    echo "   Mac: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql"
    echo "   Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# Start PostgreSQL if not running (Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start postgresql 2>/dev/null
fi

# Create database
echo "📦 Creating database..."
createdb community_magazine 2>/dev/null || echo "Database might already exist"

# Update .env.local with correct database URL
echo "📝 Updating .env.local..."
cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://localhost:5432/community_magazine"

# Authentication
JWT_SECRET="test-jwt-secret-change-in-production"
JWT_REFRESH_SECRET="test-refresh-secret-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Media Storage (using local for testing)
CLOUDINARY_CLOUD_NAME="test"
CLOUDINARY_API_KEY="test"
CLOUDINARY_API_SECRET="test"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="test"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Centre404 Community Magazine"

# Test Mode
NODE_ENV="development"
EOF

echo "🔧 Running Prisma migrations..."
npx prisma migrate dev --name init

echo "🌱 Creating seed data..."
npx prisma db seed 2>/dev/null || echo "Seeding skipped (no seed file)"

echo "✅ Database setup complete!"
echo ""
echo "📋 Test Instructions:"
echo "1. The app is running at: http://localhost:3000"
echo "2. Try submitting content as a user"
echo "3. Access admin at: http://localhost:3000/admin"
echo "4. Default test admin: admin@test.com / password123"
echo ""
echo "🎉 Happy testing!"