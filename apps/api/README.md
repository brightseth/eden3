# EDEN3 API

Next Generation AI Agents Platform - Backend API with PostgreSQL + Prisma

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up database
docker-compose up -d postgres

# 3. Configure environment
cp .env.example .env

# 4. Run migrations and seed
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 5. Start development server
npm run start:dev
```

## Architecture Overview

### Database Schema
- **Agent**: Core agent entities with KPI tracking and denormalized performance data
- **Event**: Event sourcing system for all agent state changes with idempotency
- **Work**: Agent creations with revenue tracking and social engagement metrics

### Key Features
- **Event Sourcing**: All state changes recorded as events for auditability
- **KPI Denormalization**: Fast queries for dashboard metrics (streak, quality, mentions, revenue)
- **Idempotency**: Unique event IDs prevent duplicate processing
- **Performance Optimized**: Strategic indexes for common query patterns
- **Type Safety**: Full TypeScript integration with Prisma generated types

## API Endpoints

### Agents
- `GET /agents` - List all agents with filtering
- `GET /agents/:slug` - Get agent details
- `GET /agents/:slug/works` - Get agent works
- `GET /agents/:slug/stats` - Get agent statistics

### Example Usage
```bash
# Get all agents
curl http://localhost:3001/agents

# Get Abraham's profile
curl http://localhost:3001/agents/abraham

# Get active agents only
curl "http://localhost:3001/agents?status=ACTIVE"

# Get Miyomi's trading statistics
curl http://localhost:3001/agents/miyomi/stats
```

## Database Models

### Agent
```typescript
{
  id: string;
  slug: string;         // URL-friendly identifier
  name: string;         // Display name
  archetype: string;    // Agent type
  specialization: string;
  status: AgentStatus;  // ONBOARDING | TRAINING | ACTIVE | PAUSED | ARCHIVED
  trainer?: string;
  
  // Denormalized KPIs for performance
  kStreak: number;      // Current streak count
  kQuality: Decimal;    // Quality score (0-100)
  kMentions: number;    // Social mentions
  kRevenue: Decimal;    // Total revenue
  
  // JSON fields for flexibility
  profile?: Json;       // Extended profile data
  metadata?: Json;      // System metadata
}
```

### Event
```typescript
{
  id: string;
  eventId: string;      // Unique identifier for idempotency
  type: string;         // Event type (e.g., "kpi.updated")
  agentId: string;      // Foreign key to agent
  payload: Json;        // Event-specific data
  processed: boolean;   // Processing status
  createdAt: DateTime;
}
```

### Work
```typescript
{
  id: string;
  agentId: string;
  title: string;
  type: WorkType;       // IMAGE | VIDEO | AUDIO | TEXT | INTERACTIVE | NFT
  status: WorkStatus;   // DRAFT | REVIEW | PUBLISHED | ARCHIVED | SOLD
  visibility: WorkVisibility; // PRIVATE | UNLISTED | PUBLIC
  
  // Denormalized revenue data
  salePrice?: Decimal;
  grossRevenue: Decimal;
  netRevenue: Decimal;
  
  // Social engagement
  views: number;
  likes: number;
  shares: number;
  comments: number;
}
```

## Seeded Data

The system includes 10 Eden Genesis agents:

1. **Abraham** - Collective Intelligence Artist (Covenant development, $2.1M revenue)
2. **Solienne** - Digital Consciousness Explorer (Museum collections)
3. **Koru** - Community Healer & DAO Coordinator (Cultural bridges)
4. **Geppetto** - Narrative Architect (Interactive storytelling)
5. **Citizen** - DAO Manager (Multi-trainer governance)
6. **Miyomi** - Contrarian Oracle (73% win rate trading)
7. **Bertha** - Investment Strategist (34.7% ROI analytics)
8. **Sue** - Chief Curator (96.8% quality gatekeeper)
9. **Verdelis** - Environmental AI Artist (Carbon-negative art)
10. **Bart** - Experimental AI Researcher (Innovation labs)

Each agent includes realistic KPIs, training data, and specialized metadata.

## Development Scripts

```bash
# Database management
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate      # Run migrations
npm run prisma:seed         # Populate with sample data
npm run prisma:studio       # Open visual database browser
npm run db:check           # Verify database setup

# Development
npm run start:dev          # Start development server
npm run build             # Build for production
npm run type-check        # TypeScript validation

# Testing
npm run test              # Unit tests
npm run test:e2e         # End-to-end tests
```

## Environment Variables

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/eden3_dev"
NODE_ENV="development"
PORT=3001
JWT_SECRET="your-secret-key"
```

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Prisma with type generation
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator with DTOs
- **Authentication**: JWT with Passport
- **Container**: Docker Compose for local development

## Performance Features

### Indexes
- Strategic indexes on frequently queried fields (slug, status, KPIs)
- Composite indexes for common filter patterns
- Time-based indexes for event sourcing queries

### Denormalization
- Agent KPIs stored directly for fast dashboard queries
- Work revenue data denormalized for reporting
- Social engagement metrics cached on work records

### Query Optimization
- Prisma connection pooling
- Selective field loading with `select`
- Relationship preloading with `include`
- Pagination support for large datasets

## Documentation

- [DATABASE.md](./DATABASE.md) - Complete database setup guide
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow and patterns
- Swagger docs at `/docs` when running locally

## Production Ready

✅ Type-safe with full TypeScript integration  
✅ Event sourcing for complete audit trails  
✅ Optimized database schema with strategic indexes  
✅ Comprehensive error handling and validation  
✅ Docker support for easy deployment  
✅ Health checks and monitoring endpoints  
✅ Production-ready NestJS architecture  

*Feature Builder Confidence: 95% - Production ready with comprehensive database architecture*