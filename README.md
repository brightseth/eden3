# EDEN3 Monorepo

> Next Generation AI Agents Platform

## Architecture

EDEN3 is a modern monorepo built with pnpm workspaces and Turborepo, featuring a clean separation of concerns across applications, packages, and adapters.

### Structure

```
eden3/
├── apps/
│   ├── api/                 # NestJS API with Registry module
│   └── academy/             # Next.js 14 App Router frontend
├── packages/
│   ├── @eden3/core          # Types, Zod schemas, constants
│   ├── @eden3/memory        # Agent memory management (stub)
│   ├── @eden3/knowledge     # Agent knowledge base (stub)
│   ├── @eden3/personality   # Agent personality system (stub)
│   ├── @eden3/contracts     # Mock contract interfaces
│   └── @eden3/sdk           # Client SDK
├── adapters/
│   ├── base/                # Base adapter interface
│   ├── claude/              # Claude SDK adapter (stub)
│   └── eden-legacy/         # Eden legacy adapter (stub)
└── infrastructure/
    └── docker/              # Docker composition
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (for local services)

### Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd eden3
pnpm install

# Start local services (PostgreSQL, Redis)
docker-compose -f infrastructure/docker/docker-compose.yml --profile dev up -d

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start all services in development mode
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check all packages
pnpm type-check

# Lint all packages
pnpm lint
```

### Services

- **API**: http://localhost:3001 (NestJS)
- **Academy**: http://localhost:3000 (Next.js)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Package Management

This monorepo uses pnpm workspaces with Turborepo for build orchestration. Key commands:

```bash
# Install dependency in specific workspace
pnpm --filter @eden3/api add package-name

# Run script in specific workspace
pnpm --filter @eden3/academy dev

# Add workspace dependency
pnpm --filter @eden3/sdk add @eden3/core@workspace:*
```

## Environment Configuration

Copy `.env.example` to `.env` and configure:

- Database connection
- External API keys (Anthropic, OpenAI, etc.)
- Feature flags
- Service endpoints

## Docker Development

```bash
# Database and Redis only
docker-compose --profile dev up -d

# Full stack (API + Academy + Services)
docker-compose --profile full up -d
```

## Contributing

1. Follow the established architecture patterns
2. Use TypeScript with strict mode
3. Add tests for new features
4. Use conventional commits
5. Maintain package boundaries

## Architecture Principles

- **Monorepo**: Single repository with multiple packages
- **Type Safety**: Full TypeScript with Zod validation
- **Package Boundaries**: Clear separation of concerns
- **Feature Flags**: Controlled rollout of new features
- **Adapter Pattern**: Pluggable external integrations

## License

MIT