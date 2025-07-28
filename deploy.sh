#!/bin/bash

APP_NAME="pro-medusa"

echo "🚫 Stopping $APP_NAME..."
pm2 stop $APP_NAME

echo "🧹 Cleaning old build..."
rm -rf .next

echo "📦 Installing dependencies..."
yarn install --frozen-lockfile   # or: npm ci

echo "🔨 Building Next.js app..."
yarn build                       # or: npm run build

echo "🚀 Restarting app with PM2..."
pm2 start ecosystem.config.js --only $APP_NAME

echo "✅ Deployment complete. Clear browser cache if issue persists."
