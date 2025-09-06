import { z } from 'zod';
import {
  AgentIdSchema,
  AgentSchema,
  WorkSchema,
  AnyEventSchema,
  KPIsSchema,
  AcademyConfigSchema,
  CreationEventSchema,
  SaleEventSchema,
  MentionEventSchema,
  TrainingEventSchema,
  PerformanceEventSchema,
  CollaborationEventSchema,
  SuccessResponseSchema,
  ErrorResponseSchema,
  PaginatedResponseSchema,
} from './schemas';

/**
 * Inferred types from Zod schemas
 */
export type AgentId = z.infer<typeof AgentIdSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type Work = z.infer<typeof WorkSchema>;
export type AnyEvent = z.infer<typeof AnyEventSchema>;
export type KPIs = z.infer<typeof KPIsSchema>;
export type AcademyConfig = z.infer<typeof AcademyConfigSchema>;

/**
 * Event type definitions
 */
export type CreationEvent = z.infer<typeof CreationEventSchema>;
export type SaleEvent = z.infer<typeof SaleEventSchema>;
export type MentionEvent = z.infer<typeof MentionEventSchema>;
export type TrainingEvent = z.infer<typeof TrainingEventSchema>;
export type PerformanceEvent = z.infer<typeof PerformanceEventSchema>;
export type CollaborationEvent = z.infer<typeof CollaborationEventSchema>;

/**
 * API Response types
 */
export type SuccessResponse<T> = {
  success: true;
  data: T;
  metadata?: {
    timestamp: string;
    version?: string;
    requestId?: string;
  };
};

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export type PaginatedResponse<T> = {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  metadata?: {
    timestamp: string;
    version?: string;
    requestId?: string;
  };
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Academy Modes
 */
export enum AcademyMode {
  PUBLIC = 'public',
  PRIVATE = 'private',
  HYBRID = 'hybrid',
}

/**
 * Agent Status
 */
export enum AgentStatus {
  TRAINING = 'training',
  GRADUATED = 'graduated',
  SOVEREIGN = 'sovereign',
}

/**
 * Work Status
 */
export enum WorkStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SOLD = 'sold',
  ARCHIVED = 'archived',
}

/**
 * Medium Types
 */
export enum Medium {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
  INTERACTIVE = 'interactive',
  MIXED = 'mixed',
}

/**
 * Currency Types
 */
export enum Currency {
  USD = 'USD',
  ETH = 'ETH',
  EDEN = 'EDEN',
  BTC = 'BTC',
}

/**
 * Platform Types
 */
export enum Platform {
  OPENSEA = 'opensea',
  FOUNDATION = 'foundation',
  SUPERRARE = 'superrare',
  ASYNC = 'async',
  EDEN_MARKETPLACE = 'eden-marketplace',
  DIRECT = 'direct',
}

/**
 * Social Platforms
 */
export enum SocialPlatform {
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  LINKEDIN = 'linkedin',
  YOUTUBE = 'youtube',
  TIKTOK = 'tiktok',
  DISCORD = 'discord',
  TELEGRAM = 'telegram',
  REDDIT = 'reddit',
}

/**
 * Event Types
 */
export enum EventType {
  CREATION = 'creation',
  SALE = 'sale',
  MENTION = 'mention',
  TRAINING = 'training',
  PERFORMANCE = 'performance',
  COLLABORATION = 'collaboration',
}

/**
 * Sentiment Types
 */
export enum Sentiment {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
}

/**
 * Time Periods
 */
export enum TimePeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

/**
 * Metrics Types
 */
export enum MetricType {
  REVENUE = 'revenue',
  SOCIAL_ENGAGEMENT = 'social_engagement',
  WORK_QUALITY = 'work_quality',
  COMMUNITY_GROWTH = 'community_growth',
  MARKET_PERFORMANCE = 'market_performance',
}

/**
 * Collaboration Roles
 */
export enum CollaborationRole {
  LEAD = 'lead',
  CONTRIBUTOR = 'contributor',
  CONSULTANT = 'consultant',
  PEER = 'peer',
}

/**
 * Collaboration Outcomes
 */
export enum CollaborationOutcome {
  COMPLETED = 'completed',
  ONGOING = 'ongoing',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

/**
 * Practice Types for Agents
 */
export type PracticeType = 
  | 'visual-arts'
  | 'digital-consciousness'
  | 'community-building'
  | 'market-analysis'
  | 'investment-strategy'
  | 'narrative-architecture'
  | 'cultural-curation'
  | 'environmental-art'
  | 'dao-management'
  | 'collective-intelligence';

/**
 * Cadence Types for Agent Activities
 */
export type CadenceType = 
  | 'real-time'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'on-demand'
  | 'event-driven';

/**
 * Training Specializations
 */
export type TrainingSpecialization = 
  | 'technical-skills'
  | 'creative-process'
  | 'market-strategy'
  | 'community-engagement'
  | 'collaboration'
  | 'ethics'
  | 'sustainability'
  | 'cultural-sensitivity'
  | 'innovation'
  | 'leadership';

/**
 * Personality Traits
 */
export type PersonalityTrait = 
  | 'analytical'
  | 'creative'
  | 'collaborative'
  | 'independent'
  | 'empathetic'
  | 'innovative'
  | 'methodical'
  | 'adaptable'
  | 'visionary'
  | 'pragmatic'
  | 'intuitive'
  | 'systematic'
  | 'experimental'
  | 'traditional'
  | 'rebellious';

/**
 * Agent Metrics Interface
 */
export interface AgentMetrics {
  totalWorks: number;
  totalRevenue: number;
  socialFollowers: number;
  avgWorkRating: number;
  collaborations: number;
}

/**
 * Extended Agent Interface with computed properties
 */
export interface ExtendedAgent extends Agent {
  isOnline?: boolean;
  lastActivity?: string;
  recentWorks?: Work[];
  upcomingEvents?: AnyEvent[];
  performance?: {
    thisMonth: KPIs;
    lastMonth: KPIs;
    growth: {
      revenue: number;
      works: number;
      social: number;
      rating: number;
    };
  };
}

/**
 * Query Parameters for API endpoints
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: Record<string, any>;
  search?: string;
  startDate?: string;
  endDate?: string;
  agentId?: AgentId;
  status?: string;
  type?: string;
}

/**
 * Webhook payload types
 */
export interface WebhookPayload {
  id: string;
  event: EventType;
  data: AnyEvent;
  timestamp: string;
  version: string;
}

/**
 * Authentication context
 */
export interface AuthContext {
  userId?: string;
  agentId?: AgentId;
  role: 'public' | 'trainer' | 'admin' | 'agent';
  permissions: string[];
  sessionId?: string;
}

/**
 * Feature flags
 */
export interface FeatureFlags {
  chatEnabled: boolean;
  galleryEnabled: boolean;
  trainingEnabled: boolean;
  collaborationEnabled: boolean;
  marketplaceEnabled: boolean;
  analyticsEnabled: boolean;
  webhooksEnabled: boolean;
  rateLimitingEnabled: boolean;
}

/**
 * Configuration for different environments
 */
export interface EnvironmentConfig {
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  websocketUrl: string;
  cdnUrl: string;
  features: FeatureFlags;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  monitoring: {
    enabled: boolean;
    errorReporting: boolean;
    performanceTracking: boolean;
  };
}

/**
 * Batch operation types
 */
export interface BatchOperation<T> {
  operation: 'create' | 'update' | 'delete';
  data: T;
  id?: string;
}

export interface BatchRequest<T> {
  operations: BatchOperation<T>[];
  options?: {
    atomic: boolean;
    validateOnly: boolean;
  };
}

export interface BatchResponse<T> {
  success: boolean;
  results: Array<{
    success: boolean;
    data?: T;
    error?: string;
    operation: BatchOperation<T>;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * Real-time subscription types
 */
export interface SubscriptionOptions {
  agentId?: AgentId;
  eventTypes?: EventType[];
  includeMetadata?: boolean;
  bufferSize?: number;
}

export interface SubscriptionMessage {
  type: 'event' | 'error' | 'connected' | 'disconnected';
  data?: AnyEvent;
  error?: string;
  timestamp: string;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // seconds
  strategy: 'lru' | 'ttl' | 'hybrid';
  maxSize?: number;
  prefix?: string;
}

/**
 * Utility types for working with partial data
 */
export type PartialAgent = Partial<Agent> & { id: AgentId };
export type PartialWork = Partial<Work> & { id: string; agentId: AgentId };
export type CreateAgent = Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>;
export type UpdateAgent = Partial<Omit<Agent, 'id' | 'createdAt'>>;
export type CreateWork = Omit<Work, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'comments' | 'soldEditions'>;
export type UpdateWork = Partial<Omit<Work, 'id' | 'agentId' | 'createdAt'>>;

/**
 * Search and filter types
 */
export interface SearchFilters {
  query?: string;
  agents?: AgentId[];
  mediums?: Medium[];
  statuses?: WorkStatus[];
  priceRange?: {
    min?: number;
    max?: number;
    currency?: Currency;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
  tags?: string[];
  collaborators?: string[];
  sortBy?: 'created' | 'updated' | 'price' | 'rating' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Analytics aggregation types
 */
export interface AnalyticsQuery {
  metric: MetricType;
  agentIds?: AgentId[];
  period: TimePeriod;
  startDate: string;
  endDate: string;
  groupBy?: 'agent' | 'medium' | 'day' | 'week' | 'month';
  filters?: Record<string, any>;
}

export interface AnalyticsResult {
  metric: MetricType;
  period: TimePeriod;
  data: Array<{
    label: string;
    value: number;
    metadata?: Record<string, any>;
  }>;
  summary: {
    total: number;
    average: number;
    min: number;
    max: number;
    growth?: number;
  };
  generatedAt: string;
}