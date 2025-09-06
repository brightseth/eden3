# EDEN3 Production Deployment Guide

## Overview

EDEN3 is deployed using a split architecture:
- **API**: Railway.app (NestJS backend with PostgreSQL)
- **Academy**: Vercel (Next.js frontend)

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Railway CLI installed (`npm install -g @railway/cli`)
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Git repository setup
- [ ] Production environment variables ready

## Architecture

```
┌─────────────────┐    HTTPS/API    ┌──────────────────┐
│   Vercel        │ ◄──────────────► │     Railway      │
│   (Academy)     │                  │     (API)        │
│   Next.js       │                  │     NestJS       │
└─────────────────┘                  └──────────────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │   PostgreSQL     │
                                    │   + Redis        │
                                    └──────────────────┘
```

## Step 1: API Deployment (Railway)

### 1.1 Setup Railway Project

```bash
# Login to Railway
railway login

# Create new project
railway new

# Link to existing project (if already created)
railway link [project-id]
```

### 1.2 Configure Database

```bash
# Add PostgreSQL
railway add --plugin postgresql

# Add Redis
railway add --plugin redis
```

### 1.3 Set Environment Variables

Copy values from `/apps/api/.env.production` and set in Railway:

```bash
# Core variables
railway variables set NODE_ENV=production
railway variables set DATABASE_URL="postgresql://..."
railway variables set REDIS_URL="redis://..."

# Authentication
railway variables set JWT_SECRET="your-production-jwt-secret"
railway variables set ENCRYPTION_KEY="your-production-encryption-key"

# CORS
railway variables set ALLOWED_ORIGINS="https://academy-eden3.vercel.app,https://eden3.ai"

# External APIs
railway variables set ANTHROPIC_API_KEY="your-key"
railway variables set OPENAI_API_KEY="your-key"
railway variables set REPLICATE_API_TOKEN="your-token"

# Monitoring
railway variables set SENTRY_DSN="your-sentry-dsn"
railway variables set LOG_LEVEL="info"
```

### 1.4 Deploy API

```bash
# From project root
cd apps/api

# Deploy to Railway
railway deploy

# Check deployment status
railway status

# View logs
railway logs
```

### 1.5 Run Database Migrations

```bash
# Generate Prisma client
railway run npm run prisma:generate

# Run migrations
railway run npm run prisma:deploy

# Seed database (if needed)
railway run npm run prisma:seed
```

## Step 2: Academy Deployment (Vercel)

### 2.1 Setup Vercel Project

```bash
# From academy directory
cd apps/academy

# Login to Vercel
vercel login

# Deploy (first time will create project)
vercel --prod
```

### 2.2 Set Environment Variables

In Vercel dashboard or using CLI:

```bash
# Core variables
vercel env add NEXT_PUBLIC_API_URL production
# Value: https://your-api-domain.railway.app

vercel env add NEXTAUTH_SECRET production
# Value: your-production-nextauth-secret

vercel env add NEXTAUTH_URL production
# Value: https://your-academy-domain.vercel.app

# External APIs
vercel env add ANTHROPIC_API_KEY production
vercel env add OPENAI_API_KEY production
vercel env add REPLICATE_API_TOKEN production

# Monitoring
vercel env add SENTRY_DSN production
```

### 2.3 Configure Custom Domain

```bash
# Add custom domain
vercel domains add eden3.ai
vercel domains add www.eden3.ai

# Configure DNS records as instructed by Vercel
```

## Step 3: Security Configuration

### 3.1 API Security Checklist

- [ ] HTTPS enforced (Railway handles this)
- [ ] CORS properly configured with allowed origins
- [ ] Rate limiting enabled (10 req/sec, 100 req/min)
- [ ] Helmet security headers configured
- [ ] JWT secrets are strong (64+ characters)
- [ ] Database connection uses SSL
- [ ] Environment variables are secure

### 3.2 Academy Security Checklist

- [ ] CSP headers configured in middleware
- [ ] XSS protection enabled
- [ ] Frame options set to DENY
- [ ] HTTPS redirect configured
- [ ] Referrer policy set
- [ ] NextAuth properly configured

## Step 4: Monitoring & Logging

### 4.1 Health Checks

```bash
# API health check
curl https://your-api-domain.railway.app/health

# Academy health check
curl https://your-academy-domain.vercel.app/api/health
```

### 4.2 Logging

- **Railway**: Built-in logging with `railway logs`
- **Vercel**: Function logs in dashboard
- **Sentry**: Error tracking for both applications

### 4.3 Monitoring Setup

1. **Uptime Monitoring**: Use Railway/Vercel built-in monitoring
2. **Performance**: Vercel Analytics for Academy
3. **Error Tracking**: Sentry for both applications
4. **Database**: Railway PostgreSQL metrics

## Step 5: Testing Production

### 5.1 Automated Testing

```bash
# Run production build test
./scripts/production-build.sh

# Test API endpoints
npm run test:e2e

# Test Academy pages
npm run test:academy
```

### 5.2 Manual Testing Checklist

- [ ] API health endpoint responds
- [ ] Academy loads correctly
- [ ] Authentication flow works
- [ ] API calls from Academy work
- [ ] CORS is properly configured
- [ ] Rate limiting is active
- [ ] Security headers present

## Step 6: Post-Deployment

### 6.1 DNS Configuration

```bash
# For custom domain eden3.ai
A     @       76.76.19.123  (Vercel)
CNAME api     your-api.railway.app
CNAME www     eden3.ai
```

### 6.2 SSL Certificate

Both Railway and Vercel handle SSL automatically:
- Railway: Auto-generates SSL for custom domains
- Vercel: Auto-generates SSL for custom domains

### 6.3 Backup Strategy

1. **Database**: Railway PostgreSQL automated backups
2. **Code**: Git repository backups
3. **Environment Variables**: Secure storage of production .env files

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check ALLOWED_ORIGINS includes all domains
2. **Database Connection**: Verify DATABASE_URL format
3. **Environment Variables**: Ensure all required vars are set
4. **Rate Limiting**: Monitor logs for blocked requests

### Debug Commands

```bash
# Railway API logs
railway logs --tail

# Vercel Academy logs
vercel logs [deployment-url]

# Check environment variables
railway variables
vercel env ls
```

## Production URLs

After deployment, update these values:

- **API**: `https://api-eden3.railway.app`
- **Academy**: `https://eden3.ai`
- **Docs**: `https://api-eden3.railway.app/docs`
- **Health**: `https://api-eden3.railway.app/health`

## Rollback Procedure

### API Rollback (Railway)
```bash
# View deployments
railway deployments

# Rollback to previous
railway rollback [deployment-id]
```

### Academy Rollback (Vercel)
```bash
# View deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url] --prod
```

## Performance Optimization

### API Optimizations
- Redis caching enabled
- Database connection pooling
- Compression middleware
- Rate limiting per endpoint

### Academy Optimizations
- Static generation where possible
- Image optimization enabled
- Bundle analysis with `npm run analyze`
- CDN delivery via Vercel

---

**Feature Builder Confidence: 95% - Production ready**

This deployment guide provides comprehensive instructions for a secure, scalable EDEN3 production deployment with monitoring, security, and rollback procedures.