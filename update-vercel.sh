#!/bin/bash

# Update Vercel with your Railway API URL
# Replace YOUR-RAILWAY-URL with your actual Railway URL

RAILWAY_API_URL="https://eden3-production.up.railway.app"

echo "Updating Vercel with Railway API URL: $RAILWAY_API_URL"

cd /Users/seth/eden3/apps/academy

# Remove old environment variable
vercel env rm NEXT_PUBLIC_API_URL production --yes

# Add new Railway URL
echo "$RAILWAY_API_URL" | vercel env add NEXT_PUBLIC_API_URL production

# Redeploy to production
echo "Redeploying Academy to production..."
vercel --prod

echo "Done! Your EDEN3 ecosystem is now fully deployed!"
echo "Academy: https://academy-5sshx9fhz-edenprojects.vercel.app"
echo "API: $RAILWAY_API_URL"