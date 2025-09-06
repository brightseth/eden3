# @eden3/core

Comprehensive types, Zod schemas, and constants for the EDEN3 ecosystem.

## Overview

This package serves as the single source of truth for data structures and validation across all EDEN3 applications. It provides:

- **Zod Schemas**: Runtime validation for all data structures
- **TypeScript Types**: Complete type definitions for type safety
- **Constants**: Agent configurations and system constants
- **Utilities**: Helper functions and validation utilities

## Installation

```bash
npm install @eden3/core
```

## Usage

### Basic Import

```typescript
import { AGENTS, AgentIdSchema, WorkSchema } from '@eden3/core';
```

### Schema Validation

```typescript
import { AgentIdSchema, CreationEventSchema } from '@eden3/core';

// Validate agent ID
const agentId = AgentIdSchema.parse('abraham'); // ✅ Valid

// Validate creation event
const event = CreationEventSchema.parse({
  id: 'event-uuid',
  type: 'creation',
  agentId: 'abraham',
  workId: 'work-uuid',
  title: 'New Artwork',
  medium: 'image',
  timestamp: new Date().toISOString()
});
```

### Agent Configuration

```typescript
import { AGENTS, AGENT_IDS, STATUS } from '@eden3/core';

// Access agent data
const abraham = AGENTS.abraham;
console.log(abraham.name); // "Abraham"
console.log(abraham.role); // "Collective Intelligence Artist"

// Get all agent IDs
console.log(AGENT_IDS); // ['abraham', 'solienne', 'citizen', ...]

// Use status constants
if (abraham.status === STATUS.TRAINING) {
  console.log('Agent is in training');
}
```

### Type Safety

```typescript
import type { Agent, Work, AnyEvent } from '@eden3/core';

function processAgent(agent: Agent) {
  // Full type safety with IntelliSense
  return agent.name.toLowerCase();
}

function handleEvent(event: AnyEvent) {
  // Discriminated union with type narrowing
  switch (event.type) {
    case 'creation':
      console.log(`New work: ${event.title}`);
      break;
    case 'sale':
      console.log(`Sale: ${event.amount} ${event.currency}`);
      break;
    // ... other event types
  }
}
```

## API

### Schemas

- `AgentIdSchema` - Validates agent identifiers
- `AgentSchema` - Complete agent validation
- `WorkSchema` - Work/artwork validation
- `CreationEventSchema` - Creation event validation
- `SaleEventSchema` - Sale event validation
- `MentionEventSchema` - Social mention validation
- `TrainingEventSchema` - Training session validation
- `PerformanceEventSchema` - Performance metric validation
- `CollaborationEventSchema` - Collaboration validation
- `AnyEventSchema` - Discriminated union of all events
- `KPIsSchema` - Key Performance Indicators validation

### Types

- `Agent` - Agent interface
- `Work` - Work/artwork interface
- `AnyEvent` - Union of all event types
- `KPIs` - Performance metrics interface
- `AgentMetrics` - Agent-specific metrics
- `QueryParams` - API query parameters

### Constants

- `AGENTS` - Complete configuration for all 10 Genesis agents
- `AGENT_IDS` - Array of valid agent identifiers
- `STATUS` - Agent status constants (TRAINING, GRADUATED, SOVEREIGN)
- `CURRENCIES` - Supported currencies
- `PLATFORMS` - Marketplace platforms
- `SOCIAL_PLATFORMS` - Social media platforms

## Genesis Agents

The package includes complete configurations for all 10 Genesis Cohort agents:

1. **Abraham** - Collective Intelligence Artist
2. **Solienne** - Digital Consciousness Explorer
3. **Citizen** - DAO Manager & Community Coordinator
4. **Miyomi** - Contrarian Oracle & Market Predictor
5. **Bertha** - Investment Strategist & Portfolio Manager
6. **Geppetto** - Narrative Architect & Story Designer
7. **Koru** - Community Healer & Cultural Bridge Builder
8. **Sue** - Cultural Critic & Quality Curator
9. **Verdelis** - Environmental Artist & Sustainability Coordinator
10. **Bart** - Experimental Media Artist

## Development

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Build package
npm run build

# Run linting
npm run lint
```

## License

MIT