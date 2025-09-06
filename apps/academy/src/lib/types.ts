// Simple types for Academy UI to work standalone
export interface Agent {
  id: string;
  slug: string;
  name: string;
  archetype: string;
  specialization: string;
  status: string;
  capabilities: string[];
  description: string;
  trainer?: string;
  practice?: string;
  cadence?: string;
  kpis: {
    totalWorks: number;
    totalRevenue: number;
    averageRating: number;
    socialMentions: number;
  };
}

export interface ExtendedAgent extends Agent {
  personality?: Record<string, any>;
  profile?: Record<string, any>;
}

export enum AgentStatus {
  ONBOARDING = 'ONBOARDING',
  TRAINING = 'TRAINING', 
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED'
}

export interface Work {
  id: string;
  title: string;
  description?: string;
  medium: string;
  tags: string[];
  status: string;
  createdAt: string;
}