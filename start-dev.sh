#!/bin/bash

echo "🚀 Starting TO INFINITY & BEYOND Quiz App"
echo "=========================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local with your MongoDB URI and other config"
    exit 1
fi

echo "✅ Environment file found"

# Check if MongoDB URI is set
if ! grep -q "MONGODB_URI" .env.local; then
    echo "❌ MONGODB_URI not found in .env.local"
    echo "Please add your MongoDB connection string"
    exit 1
fi

echo "✅ MongoDB URI configured"

# Start the development server
echo "🔥 Starting Next.js development server..."
npm run dev

