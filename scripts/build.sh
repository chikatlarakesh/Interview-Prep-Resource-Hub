#!/bin/bash

# Build script for production deployment

echo "🚀 Starting production build..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Build frontend for production
echo "🔨 Building frontend for production..."
npm run build

# Go back to root directory
cd ..

echo "✅ Production build completed successfully!"
echo "📁 Frontend build files are in: frontend/dist/"
echo "🚀 Ready for deployment!"

