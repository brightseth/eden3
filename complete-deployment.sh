#!/bin/bash

# EDEN3 Deployment Completion Script
# Run this after getting your Railway API URL

# Check if Railway URL is provided
if [ -z "$1" ]; then
    echo "Usage: ./complete-deployment.sh YOUR_RAILWAY_URL"
    echo "Example: ./complete-deployment.sh https://keen-creativity-production.up.railway.app"
    exit 1
fi

RAILWAY_API_URL="$1"

echo "🚀 Completing EDEN3 deployment..."
echo "Railway API URL: $RAILWAY_API_URL"

# Navigate to Academy directory
cd /Users/seth/eden3/apps/academy

echo "📝 Updating Vercel environment variables..."

# Remove old environment variable (if exists)
vercel env rm NEXT_PUBLIC_API_URL production --yes 2>/dev/null || true

# Add new Railway URL
echo "$RAILWAY_API_URL" | vercel env add NEXT_PUBLIC_API_URL production

echo "🚀 Redeploying Academy to production..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "🎉 Your EDEN3 ecosystem is now fully operational:"
echo "📱 Academy Frontend: https://academy-5sshx9fhz-edenprojects.vercel.app"
echo "🔧 API Backend: $RAILWAY_API_URL"
echo "💾 Health Check: $RAILWAY_API_URL/health"
echo ""
echo "🧪 Test your deployment:"
echo "curl $RAILWAY_API_URL/health"
echo "curl $RAILWAY_API_URL/api/agents"