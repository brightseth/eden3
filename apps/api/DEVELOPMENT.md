# EDEN3 API Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+ (or Docker)
- npm or pnpm

### Installation
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start database (Docker)
docker-compose up -d postgres

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start development server
npm run start:dev
```

### Verify Setup
```bash
# Check database setup
npm run db:check

# API should be running at:
curl http://localhost:3001/agents

# Swagger documentation:
open http://localhost:3001/docs
```

## API Endpoints

### Agents
- `GET /agents` - List all agents (with filtering)
- `GET /agents/:slug` - Get specific agent
- `GET /agents/:slug/works` - Get agent's works
- `GET /agents/:slug/stats` - Get agent statistics

### Example Requests
```bash
# Get all agents
curl http://localhost:3001/agents

# Get Abraham's details
curl http://localhost:3001/agents/abraham

# Get active agents only
curl "http://localhost:3001/agents?status=ACTIVE"

# Get Solienne's works
curl http://localhost:3001/agents/solienne/works

# Get Bertha's stats
curl http://localhost:3001/agents/bertha/stats
```

## Database Schema

### Key Models
1. **Agent** - Core agent entities with KPIs
2. **Event** - Event sourcing for state changes
3. **Work** - Agent creations with revenue tracking

### Sample Queries
```typescript
// Get top revenue agents
const topAgents = await prisma.agent.findMany({
  orderBy: { kRevenue: 'desc' },
  take: 5
});

// Get recent events
const events = await prisma.event.findMany({
  where: {
    createdAt: { gte: new Date(Date.now() - 24*60*60*1000) }
  },
  include: { agent: { select: { name: true, slug: true } } }
});

// Get published works with revenue
const works = await prisma.work.findMany({
  where: { 
    status: 'PUBLISHED',
    netRevenue: { gt: 0 }
  },
  include: { agent: true }
});
```

## Adding New Features

### 1. Create a Module
```bash
# Using NestJS CLI
npx nest generate module features/my-feature
npx nest generate controller features/my-feature
npx nest generate service features/my-feature
```

### 2. Add Database Changes
```bash
# Edit prisma/schema.prisma
# Then create migration
npm run prisma:migrate
```

### 3. Update Types
```bash
# Regenerate Prisma client after schema changes
npm run prisma:generate
```

## Event Sourcing Pattern

All agent state changes should be recorded as events:

```typescript
// Record an event
await prisma.event.create({
  data: {
    eventId: `evt_${agent.slug}_${type}_${timestamp}`,
    type: 'kpi.updated',
    agentId: agent.id,
    payload: {
      oldValues: { kStreak: 10 },
      newValues: { kStreak: 11 },
      trigger: 'daily_calculation'
    }
  }
});

// Update denormalized KPI
await prisma.agent.update({
  where: { id: agent.id },
  data: { kStreak: 11 }
});
```

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Database Tests
```bash
# Use test database
export DATABASE_URL="postgresql://postgres:password@localhost:5432/eden3_test"
npm run prisma:migrate
npm run test
```

## Deployment

### Production Setup
```bash
# Set production environment
export NODE_ENV=production
export DATABASE_URL="postgresql://user:pass@host:5432/eden3_prod"

# Deploy migrations
npm run prisma:deploy

# Build application
npm run build

# Start production server
npm run start:prod
```

### Docker Deployment
```bash
# Build image
docker build -t eden3-api .

# Run with database
docker-compose up -d
```

## Monitoring

### Health Checks
- `GET /health` - Basic health check
- `GET /health/db` - Database connectivity

### Metrics
- Prisma query logging enabled
- Request/response logging
- Error tracking

### Prisma Studio
```bash
# Visual database browser
npm run prisma:studio
# Open http://localhost:5555
```

## Common Issues

### Migration Errors
```bash
# Reset database (development only!)
npm run prisma:reset

# Check schema validation
npx prisma validate
```

### Connection Issues
```bash
# Check database status
docker-compose ps

# View database logs
docker-compose logs postgres

# Test connection
npx prisma db pull
```

### Client Generation
```bash
# Regenerate client after schema changes
npm run prisma:generate

# Clear node_modules if issues persist
rm -rf node_modules
npm install
npm run prisma:generate
```

## Architecture Patterns

### Service Layer
- Controllers handle HTTP requests
- Services contain business logic
- Repositories (via Prisma) handle data access

### Error Handling
- Use NestJS exceptions
- Catch database errors appropriately
- Return user-friendly messages

### Validation
- Use class-validator DTOs
- Validate at controller level
- Transform data consistently

### Security
- Environment-based configuration
- Input validation and sanitization
- Proper error message handling

This setup provides a solid foundation for the EDEN3 API with comprehensive database management, event sourcing capabilities, and production-ready patterns.