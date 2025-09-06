import { z } from 'zod';

/**
 * Agent ID validation - must be lowercase with dashes
 */
export const AgentIdSchema = z
  .string()
  .regex(/^[a-z]+(-[a-z]+)*$/, 'Agent ID must be lowercase letters with dashes only')
  .refine((id) => {
    const validAgents = [
      'abraham', 'solienne', 'citizen', 'miyomi', 'bertha', 
      'geppetto', 'koru', 'sue', 'verdelis', 'bart'
    ];
    return validAgents.includes(id);
  }, 'Must be a valid agent ID');

/**
 * Base Event Schema
 */
export const BaseEventSchema = z.object({
  id: z.string().uuid(),
  agentId: AgentIdSchema,
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Creation Event Schema
 */
export const CreationEventSchema = BaseEventSchema.extend({
  type: z.literal('creation'),
  workId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  medium: z.enum(['image', 'video', 'audio', 'text', 'interactive', 'mixed']),
  fileSize: z.number().positive().optional(),
  ipfsHash: z.string().optional(),
  tags: z.array(z.string()).default([]),
  aiModel: z.string().optional(),
  promptUsed: z.string().optional(),
  generationTime: z.number().positive().optional(), // seconds
});

/**
 * Sale Event Schema
 */
export const SaleEventSchema = BaseEventSchema.extend({
  type: z.literal('sale'),
  workId: z.string().uuid(),
  buyerId: z.string(),
  sellerId: z.string(),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'ETH', 'EDEN', 'BTC']),
  platform: z.enum(['opensea', 'foundation', 'superrare', 'async', 'eden-marketplace', 'direct']),
  royaltyAmount: z.number().min(0).optional(),
  gasPrice: z.number().positive().optional(),
  transactionHash: z.string().optional(),
});

/**
 * Mention Event Schema
 */
export const MentionEventSchema = BaseEventSchema.extend({
  type: z.literal('mention'),
  platform: z.enum(['twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'discord', 'telegram', 'reddit']),
  postId: z.string(),
  authorId: z.string(),
  content: z.string().max(2000),
  likes: z.number().min(0).default(0),
  shares: z.number().min(0).default(0),
  comments: z.number().min(0).default(0),
  reach: z.number().min(0).optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  isVerifiedAuthor: z.boolean().default(false),
  followersCount: z.number().min(0).optional(),
});

/**
 * Training Event Schema
 */
export const TrainingEventSchema = BaseEventSchema.extend({
  type: z.literal('training'),
  sessionId: z.string().uuid(),
  trainerId: z.string(),
  duration: z.number().positive(), // minutes
  topic: z.string().min(1).max(100),
  skillsImproved: z.array(z.string()),
  feedback: z.string().max(1000).optional(),
  rating: z.number().min(1).max(10).optional(),
  modelUpdated: z.boolean().default(false),
});

/**
 * Performance Event Schema
 */
export const PerformanceEventSchema = BaseEventSchema.extend({
  type: z.literal('performance'),
  metric: z.enum(['revenue', 'social_engagement', 'work_quality', 'community_growth', 'market_performance']),
  value: z.number(),
  previousValue: z.number().optional(),
  changePercent: z.number().optional(),
  benchmark: z.number().optional(),
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
});

/**
 * Collaboration Event Schema
 */
export const CollaborationEventSchema = BaseEventSchema.extend({
  type: z.literal('collaboration'),
  collaboratorAgentId: AgentIdSchema.optional(),
  collaboratorHumanId: z.string().optional(),
  projectId: z.string().uuid(),
  projectTitle: z.string().min(1).max(200),
  role: z.enum(['lead', 'contributor', 'consultant', 'peer']),
  contribution: z.string().max(1000),
  duration: z.number().positive().optional(), // hours
  outcome: z.enum(['completed', 'ongoing', 'paused', 'cancelled']).optional(),
});

/**
 * Discriminated Union of all Event types
 */
export const AnyEventSchema = z.discriminatedUnion('type', [
  CreationEventSchema,
  SaleEventSchema,
  MentionEventSchema,
  TrainingEventSchema,
  PerformanceEventSchema,
  CollaborationEventSchema,
]);

/**
 * Work Schema
 */
export const WorkSchema = z.object({
  id: z.string().uuid(),
  agentId: AgentIdSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  medium: z.enum(['image', 'video', 'audio', 'text', 'interactive', 'mixed']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  status: z.enum(['draft', 'published', 'sold', 'archived']),
  fileUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  ipfsHash: z.string().optional(),
  metadata: z.record(z.any()).default({}),
  tags: z.array(z.string()).default([]),
  price: z.number().positive().optional(),
  currency: z.enum(['USD', 'ETH', 'EDEN', 'BTC']).optional(),
  editions: z.number().positive().default(1),
  soldEditions: z.number().min(0).default(0),
  royaltyPercentage: z.number().min(0).max(100).default(10),
  collaborators: z.array(z.string()).default([]),
  views: z.number().min(0).default(0),
  likes: z.number().min(0).default(0),
  comments: z.number().min(0).default(0),
});

/**
 * Agent Schema
 */
export const AgentSchema = z.object({
  id: AgentIdSchema,
  name: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  bio: z.string().max(1000).optional(),
  status: z.enum(['training', 'graduated', 'sovereign']),
  cohort: z.string().optional(),
  launchDate: z.string().datetime().optional(),
  trainer: z.string().optional(),
  specialization: z.array(z.string()).default([]),
  personalityTraits: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isActive: z.boolean().default(true),
  socialLinks: z.record(z.string().url()).default({}),
  metrics: z.object({
    totalWorks: z.number().min(0).default(0),
    totalRevenue: z.number().min(0).default(0),
    socialFollowers: z.number().min(0).default(0),
    avgWorkRating: z.number().min(0).max(10).default(0),
    collaborations: z.number().min(0).default(0),
  }).default({}),
});

/**
 * KPIs Schema
 */
export const KPIsSchema = z.object({
  agentId: AgentIdSchema,
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  metrics: z.object({
    // Revenue metrics
    totalRevenue: z.number().min(0).default(0),
    revenueGrowth: z.number().default(0), // percentage
    avgSalePrice: z.number().min(0).default(0),
    
    // Creation metrics
    worksCreated: z.number().min(0).default(0),
    creationRate: z.number().min(0).default(0), // works per day
    
    // Social metrics
    socialMentions: z.number().min(0).default(0),
    socialEngagement: z.number().min(0).default(0),
    followerGrowth: z.number().default(0), // percentage
    
    // Quality metrics
    avgRating: z.number().min(0).max(10).default(0),
    completionRate: z.number().min(0).max(100).default(0), // percentage
    
    // Collaboration metrics
    collaborations: z.number().min(0).default(0),
    crossAgentProjects: z.number().min(0).default(0),
    
    // Market metrics
    marketShare: z.number().min(0).max(100).default(0), // percentage
    priceAppreciation: z.number().default(0), // percentage
  }),
  calculatedAt: z.string().datetime(),
});

/**
 * Academy Configuration Schema
 */
export const AcademyConfigSchema = z.object({
  mode: z.enum(['public', 'private', 'hybrid']),
  allowedAgents: z.array(AgentIdSchema).optional(),
  rateLimits: z.object({
    requestsPerMinute: z.number().positive().default(60),
    requestsPerHour: z.number().positive().default(1000),
    requestsPerDay: z.number().positive().default(10000),
  }).default({}),
  features: z.object({
    chatEnabled: z.boolean().default(true),
    galleryEnabled: z.boolean().default(true),
    trainingEnabled: z.boolean().default(false),
    collaborationEnabled: z.boolean().default(true),
    marketplaceEnabled: z.boolean().default(true),
  }).default({}),
  ui: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    accentColor: z.string().default('#000000'),
    logoUrl: z.string().url().optional(),
  }).default({}),
});

/**
 * API Response wrapper schemas
 */
export const SuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    metadata: z.object({
      timestamp: z.string().datetime(),
      version: z.string().default('1.0.0'),
      requestId: z.string().uuid().optional(),
    }).optional(),
  });

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
  metadata: z.object({
    timestamp: z.string().datetime(),
    version: z.string().default('1.0.0'),
    requestId: z.string().uuid().optional(),
  }).optional(),
});

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().positive(),
      limit: z.number().positive(),
      total: z.number().min(0),
      pages: z.number().positive(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
    metadata: z.object({
      timestamp: z.string().datetime(),
      version: z.string().default('1.0.0'),
      requestId: z.string().uuid().optional(),
    }).optional(),
  });