#!/bin/bash

# Complete Railway Deployment Script for Eden3 API
# This script finishes the Railway deployment and connects it to Vercel

set -e

echo "🚀 Eden3 Railway Deployment Completion Script"
echo "============================================="
echo ""

# Check if we're in the API directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Please run this script from the /Users/seth/eden3/apps/api directory"
    exit 1
fi

echo "📍 Current Railway Status:"
railway status

echo ""
echo "📋 MANUAL STEPS REQUIRED:"
echo "========================="
echo ""
echo "1️⃣  Open Railway Dashboard: https://railway.app"
echo "    - Go to your 'keen-creativity' project"
echo ""
echo "2️⃣  Add PostgreSQL Database:"
echo "    - Click '+ New' → 'Database' → 'PostgreSQL'"
echo "    - Copy the DATABASE_URL from the connection info"
echo ""
echo "3️⃣  Add Redis Cache:"
echo "    - Click '+ New' → 'Database' → 'Redis'"
echo "    - Copy the REDIS_URL from the connection info"
echo ""
echo "4️⃣  Set Environment Variables in Railway:"
echo "    Go to your service settings and add these:"
echo ""
echo "    NODE_ENV=production"
echo "    DATABASE_URL=[Your PostgreSQL URL from step 2]"
echo "    REDIS_URL=[Your Redis URL from step 3]"
echo "    JWT_SECRET=$(openssl rand -hex 32)"
echo "    ENCRYPTION_KEY=$(openssl rand -hex 16)"
echo "    ALLOWED_ORIGINS=https://academy-5sshx9fhz-edenprojects.vercel.app"
echo "    API_PORT=3001"
echo "    LOG_LEVEL=info"
echo ""
echo "5️⃣  Deploy the API:"
echo "    railway up"
echo ""
echo "6️⃣  Get your Railway URL and update Vercel:"
echo "    After deployment, Railway will show your URL"
echo "    Update Vercel with: ./update-vercel.sh [your-railway-url]"
echo ""
echo "Press Enter when you're ready to continue with the deployment..."
read

echo ""
echo "🚂 Deploying to Railway..."
echo "=========================="

# Deploy to Railway
railway up

echo ""
echo "✅ Railway deployment initiated!"
echo ""
echo "🔗 Your Railway API should be available soon at:"
echo "   Check Railway dashboard for your URL"
echo ""
echo "📝 Next Steps:"
echo "============="
echo "1. Wait for deployment to complete (2-3 minutes)"
echo "2. Get your Railway URL from the dashboard"
echo "3. Run: ./update-vercel.sh https://your-api.railway.app"
echo ""
echo "🧪 Test your deployment:"
echo "   curl https://your-api.railway.app/health"
echo "   curl https://your-api.railway.app/api/agents"
echo ""