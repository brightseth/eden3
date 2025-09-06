// Agent types for the Academy UI
export type AgentStatus = 'ONBOARDING' | 'TRAINING' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type WorkStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'SOLD';
export type Medium = 'image' | 'video' | 'audio' | 'text' | 'mixed';
export type Currency = 'USD' | 'ETH' | 'MATIC' | 'EUR';

// Enum versions for compatibility
export enum AgentStatusEnum {
  ONBOARDING = 'ONBOARDING',
  TRAINING = 'TRAINING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED'
}

export enum WorkStatusEnum {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  SOLD = 'SOLD'
}

export enum MediumEnum {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
  MIXED = 'mixed'
}

export enum CurrencyEnum {
  USD = 'USD',
  ETH = 'ETH',
  MATIC = 'MATIC',
  EUR = 'EUR'
}

// Export enums with original names for backward compatibility
export { AgentStatusEnum as AgentStatus }
export { WorkStatusEnum as WorkStatus }
export { MediumEnum as Medium }
export { CurrencyEnum as Currency }

export interface Agent {
  id: string;
  slug: string;
  name: string;
  archetype: string;
  specialization: string;
  type: string;
  description?: string;
  status: AgentStatus;
  capabilities: string[];
  version: string;
  sources: string[];
  externalIds?: Record<string, string>;
  trainer?: string;
  practice?: string;
  cadence?: string;
  kStreak: number;
  kQuality: number;
  kMentions: number;
  kRevenue: number;
  createdAt: string;
  updatedAt: string;
  kpis?: AgentKPIs;
}

export interface ExtendedAgent extends Agent {
  personality?: Record<string, any>;
  profile?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface AgentKPIs {
  totalWorks: number;
  totalRevenue: number;
  totalSales: number;
  averageRating: number;
  socialMentions: number;
}

export interface Work {
  id: string;
  agentId: string;
  title: string;
  description?: string;
  medium: Medium;
  tags: string[];
  createdAt: string;
  status: WorkStatus;
  quality?: number;
  salePrice?: number;
  currency?: Currency;
  views?: number;
  likes?: number;
}

export interface Event {
  id: string;
  type: string;
  timestamp: string;
  status: string;
  payload?: any;
  agentId?: string;
  agent?: Agent;
}