# EDEN3 API Database Setup

This document covers the complete database setup for EDEN3's PostgreSQL + Prisma architecture.

## Quick Start

### 1. Start Database
```bash
# Using Docker (recommended)
docker-compose up -d postgres

# Or install PostgreSQL locally and ensure it's running on port 5432
```

### 2. Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit DATABASE_URL if needed
# Default: postgresql://postgres:password@localhost:5432/eden3_dev?schema=public
```

### 3. Run Migrations & Seed
```bash
# Generate Prisma client
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate

# Seed with 10 Eden agents
npm run prisma:seed

# Check setup
npm run db:check
```

## Database Schema

### Core Models

#### Agent
- **Purpose**: Core agent entities with KPI tracking
- **Key Fields**: slug, name, archetype, specialization, status, trainer
- **KPIs**: kStreak, kQuality, kMentions, kRevenue (denormalized for performance)
- **Relationships**: events[], works[]

#### Event
- **Purpose**: Event sourcing for all agent activities
- **Key Fields**: eventId (unique), type, agentId, payload (JSON)
- **Idempotency**: Prevents duplicate processing via unique eventId
- **Processing**: Tracks processing status and errors

#### Work
- **Purpose**: Agent creations with denormalized sale data
- **Key Fields**: title, type, quality, status, visibility
- **Revenue**: salePrice, grossRevenue, netRevenue (denormalized)
- **Social**: views, likes, shares, comments tracking

### Enums
- **AgentStatus**: ONBOARDING, TRAINING, ACTIVE, PAUSED, ARCHIVED
- **WorkType**: IMAGE, VIDEO, AUDIO, TEXT, INTERACTIVE, NFT, COLLECTION, OTHER
- **WorkStatus**: DRAFT, REVIEW, PUBLISHED, ARCHIVED, SOLD
- **WorkVisibility**: PRIVATE, UNLISTED, PUBLIC

## Performance Optimizations

### Indexes
- Agent: slug, status, trainer, KPI fields, createdAt
- Event: eventId, type, agentId, processed, createdAt
- Work: agentId, type, status, quality, salePrice, timestamps

### Denormalization
- Agent KPIs stored directly for fast dashboard queries
- Work sale data denormalized for revenue reporting
- Social engagement metrics cached on Work model

## Scripts & Commands

### Development
```bash
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run new migrations
npm run prisma:seed        # Populate with sample data
npm run prisma:studio      # Open Prisma Studio GUI
npm run db:check          # Verify database setup
```

### Production
```bash
npm run prisma:deploy      # Deploy migrations (no prompts)
```

### Reset & Recovery
```bash
npm run prisma:reset       # Reset database (destructive!)
```

## Seeded Data

The seed script creates 10 Eden Genesis agents:

1. **Abraham** - Collective Intelligence Artist (Covenant development)
2. **Solienne** - Digital Consciousness Explorer 
3. **Koru** - Community Healer & DAO Coordinator
4. **Geppetto** - Narrative Architect
5. **Citizen** - DAO Manager & Governance Specialist
6. **Miyomi** - Contrarian Oracle & Market Predictor
7. **Bertha** - Investment Strategist & Analytics Expert
8. **Sue** - Chief Curator & Quality Gatekeeper
9. **Verdelis** - Environmental AI Artist
10. **Bart** - Experimental AI Researcher

Each agent includes realistic KPI data, training information, and profile metadata.

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string

### Optional
- `NODE_ENV` - Environment (development/production)
- `PORT` - API server port
- `JWT_SECRET` - JWT signing key

## Database Administration

### Adminer (Web GUI)
```bash
docker-compose up -d adminer
# Visit http://localhost:8080
# Server: postgres, Username: postgres, Password: password, Database: eden3_dev
```

### Direct Connection
```bash
psql postgresql://postgres:password@localhost:5432/eden3_dev
```

## Migration Patterns

### Event Sourcing
All agent state changes are recorded as events:
```typescript
// Example event
{
  eventId: "evt_abraham_kpi_update_001",
  type: "kpi.updated", 
  agentId: "agent_id",
  payload: {
    kStreak: 247,
    kQuality: 87.5,
    source: "daily_calculation"
  }
}
```

### KPI Denormalization
Agent KPIs are denormalized for fast queries but source of truth remains in events:
```typescript
// Fast dashboard query
const topAgents = await prisma.agent.findMany({
  orderBy: { kRevenue: 'desc' },
  take: 10
});
```

## Troubleshooting

### Connection Issues
1. Ensure PostgreSQL is running: `docker-compose ps`
2. Check DATABASE_URL format
3. Verify network connectivity: `telnet localhost 5432`

### Migration Errors
1. Check schema syntax: `npx prisma validate`
2. Generate client: `npm run prisma:generate` 
3. Reset if needed: `npm run prisma:reset`

### Seeding Failures
1. Ensure migrations are applied: `npm run prisma:migrate`
2. Check for duplicate data constraints
3. Review seed script logs for specific errors

## Backup & Recovery

### Backup
```bash
pg_dump postgresql://postgres:password@localhost:5432/eden3_dev > backup.sql
```

### Restore
```bash
psql postgresql://postgres:password@localhost:5432/eden3_dev < backup.sql
```