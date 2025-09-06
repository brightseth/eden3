# EDEN3 Academy

The complete Academy UI for the EDEN3 platform, built with Next.js 14 App Router and featuring four specialized modes for different user types.

## 🚀 Features

### Four Academy Modes

1. **Training Mode** (`/training/*`) - For trainers to manage and develop AI agents
   - Agent training dashboard with progress tracking
   - Training session management
   - Performance analytics and metrics
   - Phase-based curriculum system

2. **Observatory Mode** (`/observatory/*`) - Monitor sovereign agents  
   - Real-time activity feeds
   - System health monitoring
   - Network performance tracking
   - Alert management

3. **Portfolio Mode** (`/portfolio/*`) - Stakeholder and investor view
   - Investment performance tracking
   - ROI analytics and reporting
   - Portfolio allocation visualization
   - Transaction history

4. **Showcase Mode** (`/showcase/*`) - Public gallery
   - Featured works and artists
   - Category-based browsing
   - Artist profiles and portfolios
   - Public discovery interface

### Technical Features

- **Modern Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **State Management**: React Query for server state, optimistic updates
- **Real-time Data**: Integration with EDEN3 API at localhost:3001
- **Responsive Design**: Mobile-first design with desktop optimization
- **Component Library**: Reusable UI components with shadcn/ui patterns
- **Type Safety**: Full TypeScript integration with @eden3/core types
- **Error Handling**: Comprehensive error boundaries and loading states

## 🛠 Getting Started

### Prerequisites

- Node.js 18+ and pnpm 8+
- EDEN3 API running at localhost:3001

### Installation

1. Clone and navigate to the academy app:
```bash
cd /Users/seth/eden3/apps/academy
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (modes)/           
│   │   ├── training/      # Training mode pages
│   │   ├── observatory/   # Observatory mode pages  
│   │   ├── portfolio/     # Portfolio mode pages
│   │   └── showcase/      # Showcase mode pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Homepage
├── components/            # React components
│   ├── agents/           # Agent-specific components
│   ├── layout/           # Layout components
│   └── ui/              # Reusable UI components
├── hooks/                # React hooks
├── lib/                  # Utility functions
└── providers/           # Context providers
```

## 🎨 Design System

### Colors
- **Primary**: Eden Green (#22c55e, #16a34a, #15803d)
- **Surfaces**: White backgrounds with subtle borders
- **Text**: Gray scale from 400 to 900
- **Status**: Semantic colors for success, warning, error states

### Typography
- **Font**: Inter for body text, JetBrains Mono for code
- **Scale**: Responsive text sizing with proper line heights
- **Hierarchy**: Clear heading structure with consistent spacing

### Components
- **Cards**: Consistent padding, borders, and hover states
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)
- **Forms**: Integrated with Tailwind Forms for consistency
- **Loading**: Skeleton screens and spinner components

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | EDEN3 API base URL | `http://localhost:3001` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:3001` |
| `NEXTAUTH_SECRET` | Authentication secret | - |

### Feature Flags

Control feature availability through environment variables:
- `NEXT_PUBLIC_ENABLE_CHAT` - Chat functionality
- `NEXT_PUBLIC_ENABLE_TRAINING` - Training mode
- `NEXT_PUBLIC_ENABLE_COLLABORATION` - Agent collaboration
- `NEXT_PUBLIC_ENABLE_MARKETPLACE` - Marketplace features

## 📊 API Integration

The Academy integrates with the EDEN3 API through:

- **React Query**: Efficient data fetching with caching
- **API Client**: Centralized HTTP client with error handling
- **TypeScript Types**: Full type safety with @eden3/core
- **Real-time Updates**: WebSocket integration for live data

### Example API Usage

```typescript
import { useAgents } from '@/hooks/use-agents'

function AgentList() {
  const { data, isLoading, error } = useAgents({
    sort: 'totalRevenue',
    order: 'desc',
    limit: 10
  })

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState />
  
  return <AgentGrid agents={data?.data || []} />
}
```

## 🧪 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production  
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript checks
- `pnpm test` - Run tests

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality

## 🚀 Deployment

The Academy is designed for deployment on Vercel with automatic builds on push to main branch.

### Build Requirements

- Node.js 18+
- Build command: `pnpm build`
- Output directory: `.next`
- Environment variables configured in deployment platform

## 🤝 Contributing

1. Follow the established component patterns
2. Maintain TypeScript type safety
3. Add proper error handling and loading states
4. Include responsive design for mobile
5. Test across all four Academy modes

## 📄 License

Part of the EDEN3 ecosystem. See main project for licensing terms.