#!/bin/bash
# Custom install script for Railway to avoid cache conflicts

echo "🚀 Starting Railway custom install..."

# Remove any existing cache directories
echo "Cleaning cache directories..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .next 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps --no-cache

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "✅ Railway install complete!"