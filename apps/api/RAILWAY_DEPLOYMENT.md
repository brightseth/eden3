# Railway Deployment Guide for Eden3 API

## Project Information
- **Project Name**: keen-creativity
- **Service Name**: eden3
- **Production URL**: https://eden3-production.up.railway.app
- **Environment**: production

## Deployment Configuration

### Railway.toml Configuration
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npx prisma generate && npm run build"

[deploy]
startCommand = "npx prisma migrate deploy && npm run start:prod"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[variables]
PORT = "3001"
NODE_ENV = "production"
```

## Environment Variables

### Required Variables (Already Configured)
- ✅ `DATABASE_URL` - PostgreSQL connection (Railway internal)
- ✅ `REDIS_URL` - Redis connection (Railway internal)
- ✅ `JWT_SECRET` - Authentication secret
- ✅ `NODE_ENV` - Set to "production"
- ✅ `ENCRYPTION_KEY` - Data encryption key
- ✅ `ALLOWED_ORIGINS` - CORS configuration

### Optional Variables to Add
- `API_KEY` - For authenticated endpoints
- `WEBHOOK_SECRET` - For webhook HMAC verification
- `OPENAI_API_KEY` - If using OpenAI services
- `REPLICATE_API_TOKEN` - If using Replicate services
- `LOG_LEVEL` - Set to "info" or "debug"
- `RATE_LIMIT_MAX_REQUESTS` - Default: 100

## Deployment Commands

### Initial Setup
```bash
# Login to Railway
railway login

# Link to project
railway link -p keen-creativity

# Link to service
railway service eden3
```

### Deploy Application
```bash
# Deploy to Railway
railway up

# Deploy in detached mode
railway up --detach
```

### Monitoring
```bash
# Check status
railway status

# View logs
railway logs

# List environment variables
railway variables
```

## Health Check
Once deployed, verify the API is running:
```bash
curl https://eden3-production.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check `package.json` dependencies
   - Ensure Prisma schema is valid
   - Verify all npm packages are installable

2. **Start Failures**
   - Check database migrations
   - Verify environment variables
   - Check start script path: `node dist/src/main`

3. **Connection Issues**
   - Ensure PORT variable is set
   - Check CORS configuration
   - Verify database URL is correct

### Debug Commands
```bash
# Run locally with production config
NODE_ENV=production npm run build
NODE_ENV=production npm run start:prod

# Test database connection
npx prisma db pull

# Generate Prisma client
npx prisma generate
```

## API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `GET /api/v1/agents` - List agents
- `POST /api/v1/agents` - Create agent
- `GET /api/v1/agents/:id` - Get agent details
- `PUT /api/v1/agents/:id` - Update agent
- `DELETE /api/v1/agents/:id` - Delete agent

### Authentication
Most endpoints require JWT authentication:
```
Authorization: Bearer <jwt-token>
```

## Notes
- The API uses NestJS framework
- Database: PostgreSQL with Prisma ORM
- Queue system: Redis with BullMQ
- The service auto-restarts on failure (max 3 retries)
- Health checks run every 30 seconds

## Build Logs
Monitor build progress at:
https://railway.app/project/c4388663-79f0-4c00-b4af-d4a8814e5df8/service/3e6ca00a-c8ee-4484-99d8-e69a6d7879a7

## Support
- Railway Dashboard: https://railway.app
- Railway Docs: https://docs.railway.app
- Project Dashboard: https://railway.app/project/c4388663-79f0-4c00-b4af-d4a8814e5df8