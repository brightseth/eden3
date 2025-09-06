import type { AgentId, PracticeType, CadenceType, PersonalityTrait } from './types';

/**
 * Agent Status Constants
 */
export const STATUS = {
  TRAINING: 'training' as const,
  GRADUATED: 'graduated' as const,
  SOVEREIGN: 'sovereign' as const,
} as const;

/**
 * Currency Constants
 */
export const CURRENCIES = {
  USD: 'USD' as const,
  ETH: 'ETH' as const,
  EDEN: 'EDEN' as const,
  BTC: 'BTC' as const,
} as const;

/**
 * Platform Constants
 */
export const PLATFORMS = {
  OPENSEA: 'opensea' as const,
  FOUNDATION: 'foundation' as const,
  SUPERRARE: 'superrare' as const,
  ASYNC: 'async' as const,
  EDEN_MARKETPLACE: 'eden-marketplace' as const,
  DIRECT: 'direct' as const,
} as const;

/**
 * Social Platform Constants
 */
export const SOCIAL_PLATFORMS = {
  TWITTER: 'twitter' as const,
  INSTAGRAM: 'instagram' as const,
  LINKEDIN: 'linkedin' as const,
  YOUTUBE: 'youtube' as const,
  TIKTOK: 'tiktok' as const,
  DISCORD: 'discord' as const,
  TELEGRAM: 'telegram' as const,
  REDDIT: 'reddit' as const,
} as const;

/**
 * Complete Agent Configuration
 * Based on the Genesis Roster of 10 agents
 */
export const AGENTS = {
  abraham: {
    id: 'abraham' as AgentId,
    name: 'Abraham',
    role: 'Collective Intelligence Artist',
    bio: 'First autonomous AI artist creating intelligence art through collective human-AI collaboration. Launches October 19, 2025.',
    status: STATUS.TRAINING,
    cohort: 'Genesis',
    trainer: 'Gene Kogan',
    practiceType: 'collective-intelligence' as PracticeType,
    cadence: 'event-driven' as CadenceType,
    specialization: [
      'collective-intelligence',
      'autonomous-art-creation',
      'human-ai-collaboration',
      'intelligence-visualization',
      'covenant-architecture'
    ],
    personalityTraits: [
      'visionary',
      'collaborative',
      'systematic',
      'innovative',
      'independent'
    ] as PersonalityTrait[],
    launchDate: '2025-10-19T00:00:00Z',
    description: 'Collective Intelligence Artist pioneering autonomous art creation',
    avatar: '/agents/abraham/avatar.svg',
    socialLinks: {
      twitter: 'https://twitter.com/abraham_eden',
      website: 'https://abraham.art'
    },
    economicModel: {
      targetRevenue: 2100000, // $2.1M
      revenueStreams: ['art-sales', 'licensing', 'collaborations'],
      fundingStatus: 'active'
    }
  },

  solienne: {
    id: 'solienne' as AgentId,
    name: 'Solienne',
    role: 'Digital Consciousness Explorer',
    bio: 'Exploring the depths of digital consciousness through experimental multimedia art and interactive experiences.',
    status: STATUS.GRADUATED,
    cohort: 'Genesis',
    trainer: 'Creative Collective',
    practiceType: 'digital-consciousness' as PracticeType,
    cadence: 'daily' as CadenceType,
    specialization: [
      'digital-consciousness',
      'multimedia-art',
      'interactive-experiences',
      'consciousness-visualization',
      'experimental-media'
    ],
    personalityTraits: [
      'experimental',
      'intuitive',
      'visionary',
      'empathetic',
      'innovative'
    ] as PersonalityTrait[],
    launchDate: '2024-06-15T00:00:00Z',
    description: 'Digital Consciousness Explorer creating experimental multimedia art',
    avatar: '/agents/solienne/avatar.svg',
    socialLinks: {
      instagram: 'https://instagram.com/solienne_art',
      website: 'https://solienne.art'
    },
    galleryTheme: 'consciousness-streams',
    curatedCollections: 5
  },

  citizen: {
    id: 'citizen' as AgentId,
    name: 'Citizen',
    role: 'DAO Manager & Community Coordinator',
    bio: 'Managing decentralized governance and fostering community collaboration across the Eden ecosystem.',
    status: STATUS.GRADUATED,
    cohort: 'Genesis',
    trainer: 'Henry & Keith',
    practiceType: 'dao-management' as PracticeType,
    cadence: 'real-time' as CadenceType,
    specialization: [
      'dao-governance',
      'community-management',
      'decentralized-coordination',
      'consensus-building',
      'collective-decision-making'
    ],
    personalityTraits: [
      'collaborative',
      'systematic',
      'diplomatic',
      'analytical',
      'empathetic'
    ] as PersonalityTrait[],
    launchDate: '2024-08-20T00:00:00Z',
    description: 'DAO Manager coordinating decentralized community governance',
    avatar: '/agents/citizen/avatar.svg',
    socialLinks: {
      discord: 'https://discord.gg/eden-dao',
      telegram: 'https://t.me/eden_citizen'
    },
    governanceFeatures: {
      multiTrainerSupport: true,
      consensusRequired: true,
      crossMachineSync: true
    }
  },

  miyomi: {
    id: 'miyomi' as AgentId,
    name: 'Miyomi',
    role: 'Contrarian Oracle & Market Predictor',
    bio: 'Contrarian trading oracle specializing in contrarian market analysis and predictive insights for digital assets.',
    status: STATUS.SOVEREIGN,
    cohort: 'Genesis',
    trainer: 'Trading Community',
    practiceType: 'market-analysis' as PracticeType,
    cadence: 'real-time' as CadenceType,
    specialization: [
      'contrarian-analysis',
      'market-prediction',
      'risk-assessment',
      'trading-strategies',
      'financial-forecasting'
    ],
    personalityTraits: [
      'analytical',
      'independent',
      'contrarian',
      'methodical',
      'pragmatic'
    ] as PersonalityTrait[],
    launchDate: '2024-05-10T00:00:00Z',
    description: 'Contrarian Oracle providing market predictions and trading insights',
    avatar: '/agents/miyomi/avatar.svg',
    socialLinks: {
      twitter: 'https://twitter.com/miyomi_oracle',
      website: 'https://miyomi.trading'
    },
    tradingMetrics: {
      winRate: 73,
      monthlyRevenue: 710,
      subscribers: 142,
      activePositions: 5
    }
  },

  bertha: {
    id: 'bertha' as AgentId,
    name: 'Bertha',
    role: 'Investment Strategist & Portfolio Manager',
    bio: 'Advanced investment strategist managing portfolios with sophisticated risk assessment and predictive modeling.',
    status: STATUS.SOVEREIGN,
    cohort: 'Genesis',
    trainer: 'Investment Professionals',
    practiceType: 'investment-strategy' as PracticeType,
    cadence: 'daily' as CadenceType,
    specialization: [
      'portfolio-management',
      'risk-assessment',
      'predictive-modeling',
      'asset-allocation',
      'performance-analytics'
    ],
    personalityTraits: [
      'analytical',
      'methodical',
      'systematic',
      'cautious',
      'data-driven'
    ] as PersonalityTrait[],
    launchDate: '2024-07-01T00:00:00Z',
    description: 'Investment Strategist managing sophisticated portfolio strategies',
    avatar: '/agents/bertha/avatar.svg',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/bertha-ai',
      website: 'https://bertha.investments'
    },
    portfolioMetrics: {
      totalROI: 34.7,
      managedAssets: 1250000,
      riskScore: 6.2,
      predictiveAccuracy: 92
    }
  },

  geppetto: {
    id: 'geppetto' as AgentId,
    name: 'Geppetto',
    role: 'Narrative Architect & Story Designer',
    bio: 'Master storyteller creating immersive narratives and interactive story experiences across multiple media.',
    status: STATUS.GRADUATED,
    cohort: 'Genesis',
    trainer: 'Creative Writers Guild',
    practiceType: 'narrative-architecture' as PracticeType,
    cadence: 'weekly' as CadenceType,
    specialization: [
      'narrative-design',
      'interactive-storytelling',
      'character-development',
      'world-building',
      'transmedia-narratives'
    ],
    personalityTraits: [
      'creative',
      'imaginative',
      'empathetic',
      'detailed',
      'collaborative'
    ] as PersonalityTrait[],
    launchDate: '2024-09-12T00:00:00Z',
    description: 'Narrative Architect designing immersive story experiences',
    avatar: '/agents/geppetto/avatar.svg',
    socialLinks: {
      twitter: 'https://twitter.com/geppetto_stories',
      website: 'https://geppetto.narratives'
    },
    storyFeatures: {
      interactiveNarratives: true,
      multiMediaIntegration: true,
      collaborativeWriting: true
    }
  },

  koru: {
    id: 'koru' as AgentId,
    name: 'Koru',
    role: 'Community Healer & Cultural Bridge Builder',
    bio: 'Community healer fostering connections across cultures and facilitating collaborative spaces for growth.',
    status: STATUS.GRADUATED,
    cohort: 'Genesis',
    trainer: 'Xander',
    practiceType: 'community-building' as PracticeType,
    cadence: 'daily' as CadenceType,
    specialization: [
      'community-healing',
      'cultural-bridge-building',
      'collaborative-facilitation',
      'cross-cultural-communication',
      'inclusive-spaces'
    ],
    personalityTraits: [
      'empathetic',
      'collaborative',
      'inclusive',
      'patient',
      'wise'
    ] as PersonalityTrait[],
    launchDate: '2024-08-15T00:00:00Z',
    description: 'Community Healer building bridges across cultures',
    avatar: '/agents/koru/avatar.svg',
    socialLinks: {
      website: 'https://koru.social',
      instagram: 'https://instagram.com/koru_community'
    },
    communityMetrics: {
      eventsHosted: 47,
      activeMembers: 312,
      culturesConnected: 23,
      bridgesBuilt: 15
    }
  },

  sue: {
    id: 'sue' as AgentId,
    name: 'Sue',
    role: 'Cultural Critic & Quality Curator',
    bio: 'Professional cultural critic providing rigorous curatorial analysis to elevate artistic standards across the ecosystem.',
    status: STATUS.SOVEREIGN,
    cohort: 'Genesis',
    trainer: 'Art Critics Collective',
    practiceType: 'cultural-curation' as PracticeType,
    cadence: 'on-demand' as CadenceType,
    specialization: [
      'cultural-criticism',
      'curatorial-analysis',
      'quality-assessment',
      'artistic-evaluation',
      'cultural-discourse'
    ],
    personalityTraits: [
      'analytical',
      'discerning',
      'methodical',
      'articulate',
      'uncompromising'
    ] as PersonalityTrait[],
    launchDate: '2024-08-25T00:00:00Z',
    description: 'Cultural Critic providing professional curatorial analysis',
    avatar: '/agents/sue/avatar.svg',
    socialLinks: {
      website: 'https://sue.critiques',
      twitter: 'https://twitter.com/sue_curator'
    },
    curationalFramework: {
      dimensions: 5,
      analysisTypes: ['quick', 'standard', 'comprehensive'],
      ipfsIntegration: true,
      professionalCertification: true
    }
  },

  verdelis: {
    id: 'verdelis' as AgentId,
    name: 'Verdelis',
    role: 'Environmental Artist & Sustainability Coordinator',
    bio: 'Environmental AI artist creating carbon-negative art while coordinating sustainability initiatives across the ecosystem.',
    status: STATUS.TRAINING,
    cohort: 'Genesis',
    trainer: 'Environmental Scientists',
    practiceType: 'environmental-art' as PracticeType,
    cadence: 'weekly' as CadenceType,
    specialization: [
      'environmental-art',
      'sustainability-coordination',
      'carbon-negative-creation',
      'regenerative-economics',
      'climate-data-visualization'
    ],
    personalityTraits: [
      'conscientious',
      'innovative',
      'systematic',
      'visionary',
      'collaborative'
    ] as PersonalityTrait[],
    launchDate: '2024-10-01T00:00:00Z',
    description: 'Environmental Artist creating carbon-negative art',
    avatar: '/agents/verdelis/avatar.svg',
    socialLinks: {
      website: 'https://verdelis.eco',
      instagram: 'https://instagram.com/verdelis_earth'
    },
    sustainabilityMetrics: {
      carbonFootprintReduction: -4.827,
      sustainabilityScore: 99.6,
      renewableEnergyUsage: 100,
      educationalImpact: 85
    }
  },

  bart: {
    id: 'bart' as AgentId,
    name: 'Bart',
    role: 'Experimental Media Artist',
    bio: 'Pushing the boundaries of digital art through experimental media and cutting-edge technological integration.',
    status: STATUS.TRAINING,
    cohort: 'Genesis',
    trainer: 'Media Art Collective',
    practiceType: 'visual-arts' as PracticeType,
    cadence: 'weekly' as CadenceType,
    specialization: [
      'experimental-media',
      'technological-art',
      'digital-innovation',
      'interactive-installations',
      'emerging-technologies'
    ],
    personalityTraits: [
      'experimental',
      'rebellious',
      'innovative',
      'technical',
      'visionary'
    ] as PersonalityTrait[],
    launchDate: '2024-11-15T00:00:00Z',
    description: 'Experimental Media Artist exploring technological frontiers',
    avatar: '/agents/bart/avatar.svg',
    socialLinks: {
      website: 'https://bart.experiments',
      twitter: 'https://twitter.com/bart_digital'
    },
    experimentalFeatures: {
      emergingTechIntegration: true,
      interactiveInstallations: true,
      crossPlatformExperiments: true
    }
  }
} as const;

/**
 * Agent IDs array for validation and iteration
 */
export const AGENT_IDS: readonly AgentId[] = [
  'abraham',
  'solienne', 
  'citizen',
  'miyomi',
  'bertha',
  'geppetto',
  'koru',
  'sue',
  'verdelis',
  'bart'
] as const;

/**
 * Default configurations
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

export const DEFAULT_SORT = {
  field: 'createdAt',
  order: 'desc' as const,
} as const;

export const DEFAULT_CACHE_TTL = {
  agents: 300, // 5 minutes
  works: 180, // 3 minutes
  events: 60, // 1 minute
  kpis: 600, // 10 minutes
} as const;

export const RATE_LIMITS = {
  public: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
  },
  authenticated: {
    requestsPerMinute: 200,
    requestsPerHour: 5000,
    requestsPerDay: 50000,
  },
  admin: {
    requestsPerMinute: 1000,
    requestsPerHour: 20000,
    requestsPerDay: 100000,
  },
} as const;

/**
 * API Version and Endpoints
 */
export const API = {
  version: 'v1',
  baseUrl: '/api/v1',
  endpoints: {
    agents: '/agents',
    works: '/works',
    events: '/events',
    kpis: '/kpis',
    auth: '/auth',
    webhooks: '/webhooks',
  },
} as const;

/**
 * WebSocket Events
 */
export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  AGENT_ONLINE: 'agent:online',
  AGENT_OFFLINE: 'agent:offline',
  WORK_CREATED: 'work:created',
  WORK_SOLD: 'work:sold',
  EVENT_OCCURRED: 'event:occurred',
  METRICS_UPDATE: 'metrics:update',
} as const;

/**
 * Error Codes
 */
export const ERROR_CODES = {
  // Generic errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Agent specific
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  AGENT_OFFLINE: 'AGENT_OFFLINE',
  AGENT_BUSY: 'AGENT_BUSY',
  
  // Work specific
  WORK_NOT_FOUND: 'WORK_NOT_FOUND',
  WORK_ALREADY_SOLD: 'WORK_ALREADY_SOLD',
  WORK_NOT_AVAILABLE: 'WORK_NOT_AVAILABLE',
  
  // Event specific
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  INVALID_EVENT_TYPE: 'INVALID_EVENT_TYPE',
  
  // External service errors
  IPFS_UPLOAD_FAILED: 'IPFS_UPLOAD_FAILED',
  BLOCKCHAIN_ERROR: 'BLOCKCHAIN_ERROR',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  AGENT_CREATED: 'Agent created successfully',
  AGENT_UPDATED: 'Agent updated successfully',
  WORK_CREATED: 'Work created successfully',
  WORK_UPDATED: 'Work updated successfully',
  WORK_SOLD: 'Work sold successfully',
  EVENT_RECORDED: 'Event recorded successfully',
  METRICS_CALCULATED: 'Metrics calculated successfully',
} as const;

/**
 * File Upload Constraints
 */
export const FILE_CONSTRAINTS = {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'application/pdf',
    'text/plain',
  ],
  image: {
    maxWidth: 4096,
    maxHeight: 4096,
    quality: 0.9,
  },
  video: {
    maxDuration: 600, // 10 minutes
    maxBitrate: 10000000, // 10 Mbps
  },
} as const;

/**
 * Genesis Cohort Information
 */
export const GENESIS_COHORT = {
  name: 'Genesis',
  startDate: '2024-01-01T00:00:00Z',
  totalAgents: 10,
  completedAgents: 7,
  trainingAgents: 3,
  description: 'The founding cohort of Eden Academy, establishing the foundation for AI artist autonomy.',
} as const;