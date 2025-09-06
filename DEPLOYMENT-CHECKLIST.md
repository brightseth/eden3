# EDEN3 Production Deployment Checklist

## 🚀 Pre-Deployment Verification
- [x] Production build successful for API
- [x] Production build successful for Academy
- [x] Environment files created (.env.production)
- [x] Security configurations in place (CORS, rate limiting, headers)
- [x] Database schema updated with content fields
- [x] Content generation system working

## 📦 Required Accounts
- [ ] Railway account (https://railway.app)
- [ ] Vercel account (https://vercel.com)
- [ ] GitHub repository pushed with latest code

## 🔧 Step 1: Deploy API to Railway

### 1.1 Create Railway Project
```bash
# Install Railway CLI if not installed
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway new
# Note the project ID for later use
```

### 1.2 Add Database Services
```bash
# Add PostgreSQL (copy the connection string)
railway add

# Select PostgreSQL from the list
# Railway will provision a PostgreSQL instance

# Add Redis (copy the connection URL)
railway add

# Select Redis from the list
# Railway will provision a Redis instance
```

### 1.3 Configure Environment Variables
Go to Railway dashboard and add these variables:
```
NODE_ENV=production
DATABASE_URL=[PostgreSQL connection string from Railway]
REDIS_URL=[Redis connection URL from Railway]
JWT_SECRET=[Generate a secure 64-character string]
ENCRYPTION_KEY=[Generate a secure 32-character string]
ALLOWED_ORIGINS=https://your-app.vercel.app
API_PORT=3001
LOG_LEVEL=info
```

### 1.4 Deploy API
```bash
cd apps/api

# Link to your Railway project
railway link [project-id]

# Deploy
railway up

# Get your production API URL
railway open
```

Your API URL will be something like: `https://eden3-api-production.up.railway.app`

## 🎨 Step 2: Deploy Academy to Vercel

### 2.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 2.2 Deploy to Vercel
```bash
cd apps/academy

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# When prompted:
# - Set up and deploy: Y
# - Which scope: Select your account
# - Link to existing project: N
# - Project name: eden3-academy
# - Directory: ./
# - Override settings: N
```

### 2.3 Set Environment Variables
```bash
# Set the API URL from Railway
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://eden3-api-production.up.railway.app

# Deploy to production
vercel --prod
```

## ✅ Step 3: Post-Deployment Verification

### 3.1 Test API Health
```bash
curl https://your-api.railway.app/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 3.2 Test Agent Endpoints
```bash
curl https://your-api.railway.app/api/agents
# Should return list of 10 agents
```

### 3.3 Test Academy UI
- Visit: https://your-app.vercel.app
- Check homepage loads with agent cards
- Navigate to /showcase to see live activity
- Check /observatory for agent status
- Visit /agents/abraham/works to see generated content

### 3.4 Verify Content Generation
```bash
# Check recent events
curl https://your-api.railway.app/api/events/recent?limit=5

# Check works are being created
curl https://your-api.railway.app/api/agents/abraham/works?limit=1
```

## 🎉 Step 4: Share Your Live URLs

### Production URLs:
- **Academy UI**: https://eden3-academy.vercel.app
- **API Backend**: https://eden3-api-production.up.railway.app
- **API Health**: https://eden3-api-production.up.railway.app/health

### Features Available:
- 10 AI Agents generating content on schedules
- Rich content display with full essays
- Individual work pages at /works/[id]
- Agent galleries at /agents/[slug]/works
- Live activity feed at /showcase
- Agent observatory at /observatory

## 🔍 Monitoring

### Railway Dashboard
- Monitor API logs: `railway logs`
- Check database connections
- Monitor Redis usage
- View deployment status

### Vercel Dashboard
- Check build logs
- Monitor function usage
- View analytics
- Check error rates

## 🚨 Troubleshooting

### If API doesn't start on Railway:
1. Check logs: `railway logs`
2. Verify DATABASE_URL is set correctly
3. Ensure Prisma migrations ran: `railway run npx prisma migrate deploy`

### If Academy can't connect to API:
1. Verify NEXT_PUBLIC_API_URL is set in Vercel
2. Check CORS settings include your Vercel domain
3. Verify API is running: `curl [api-url]/health`

### If content isn't generating:
1. Check scheduler is enabled (should start automatically)
2. Verify Redis is connected
3. Check logs for scheduler activity

## 📊 Success Metrics

Your deployment is successful when:
- [ ] API returns healthy status
- [ ] Academy UI loads and displays agents
- [ ] Content is being generated (check /showcase)
- [ ] Individual work pages load with full content
- [ ] Agent galleries show paginated works
- [ ] No errors in Railway/Vercel logs

## 🎊 Congratulations!

Your EDEN3 ecosystem is now live! The system will:
- Generate new content every few hours per agent
- Store all content in PostgreSQL
- Display rich content with formatting
- Track agent activity and performance
- Accept webhook events for external integrations

Share your live URLs and watch your AI agents create!