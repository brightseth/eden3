import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RegistryService } from '../registry/registry.service';

export interface SimpleAgent {
  id: string;
  slug: string;
  name: string;
  type: string;
  description?: string;
  status: string;
  capabilities: string[];
  version: string;
  sources: string[]; // Add sources array
  externalIds?: Record<string, string>; // Add external IDs mapping
  createdAt: string;
  updatedAt: string;
  kpis?: {
    totalWorks: number;
    totalRevenue: number;
    totalSales: number;
    averageRating: number;
    socialMentions: number;
  };
}

export interface DetailedAgent extends SimpleAgent {
  archetype: string;
  specialization: string;
  personality?: Record<string, any>;
  profile?: Record<string, any>;
  metadata?: Record<string, any>;
  trainer?: string;
  practice?: string;
  cadence?: string;
}

export interface SuccessResponse<T> {
  success: boolean;
  data: T;
  metadata: {
    timestamp: string;
    requestId: string;
  };
}

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly registryService: RegistryService,
  ) {}

  /**
   * Find all agents with filtering and pagination
   */
  async findAll(filters: {
    status?: string;
    type?: string;
    source?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<SuccessResponse<{
    agents: SimpleAgent[];
    total: number;
    limit: number;
    offset: number;
  }>> {
    const { status, type, source = 'all', limit = 20, offset = 0 } = filters;

    try {
      const whereClause: any = {};
      
      if (status) {
        whereClause.status = status;
      }
      
      if (type) {
        whereClause.type = {
          contains: type,
          mode: 'insensitive',
        };
      }

      // Handle source filtering with multi-source support
      // Note: Since sources is a JSON array stored as string, we need to filter in memory
      // For production, consider using Prisma's JSON filtering or a proper database
      
      let agents = await this.prisma.agent.findMany({
        where: whereClause,
        include: {
          kpis: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Filter by source if specified
      if (source && source !== 'all') {
        agents = agents.filter(agent => {
          const sources = this.parseJsonString<string[]>(agent.sources, []);
          return sources.includes(source);
        });
      }

      // Apply pagination after filtering
      const total = agents.length;
      const paginatedAgents = agents.slice(offset, offset + limit);

      const formattedAgents: SimpleAgent[] = paginatedAgents.map(agent => ({
        id: agent.id,
        slug: agent.slug,
        name: agent.name,
        type: agent.type,
        description: agent.description,
        status: agent.status,
        capabilities: this.parseCommaSeparatedString(agent.capabilities),
        version: agent.version,
        sources: this.parseJsonString<string[]>(agent.sources, ['eden3-native']),
        externalIds: this.parseJsonString<Record<string, string>>(agent.externalIds, {}),
        createdAt: agent.createdAt.toISOString(),
        updatedAt: agent.updatedAt.toISOString(),
        kpis: agent.kpis ? {
          totalWorks: agent.kpis.totalWorks,
          totalRevenue: Number(agent.kpis.totalRevenue),
          totalSales: agent.kpis.totalSales,
          averageRating: Number(agent.kpis.averageRating),
          socialMentions: agent.kpis.socialMentions,
        } : undefined,
      }));

      this.logger.log(`Retrieved ${formattedAgents.length}/${total} agents`, {
        filters,
        total,
        returned: formattedAgents.length,
      });

      return {
        success: true,
        data: {
          agents: formattedAgents,
          total,
          limit,
          offset,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch agents', error);
      throw error;
    }
  }

  /**
   * Find agent by slug with complete details
   */
  async findBySlug(slug: string): Promise<SuccessResponse<DetailedAgent>> {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { slug },
        include: {
          kpis: true,
          _count: {
            select: {
              works: true,
              trainingSessions: true,
            },
          },
        },
      });

      if (!agent) {
        throw new NotFoundException(`Agent ${slug} not found`);
      }

      const formattedAgent: DetailedAgent = {
        id: agent.id,
        slug: agent.slug,
        name: agent.name,
        archetype: agent.archetype,
        specialization: agent.specialization,
        type: agent.type,
        description: agent.description,
        status: agent.status,
        capabilities: this.parseCommaSeparatedString(agent.capabilities),
        version: agent.version,
        sources: this.parseJsonString<string[]>(agent.sources, ['eden3-native']),
        externalIds: this.parseJsonString<Record<string, string>>(agent.externalIds, {}),
        personality: this.parseJsonString(agent.personality, {}),
        profile: this.parseJsonString(agent.profile, {}),
        metadata: this.parseJsonString(agent.metadata, {}),
        trainer: agent.trainer,
        practice: agent.practice,
        cadence: agent.cadence,
        createdAt: agent.createdAt.toISOString(),
        updatedAt: agent.updatedAt.toISOString(),
        kpis: agent.kpis ? {
          totalWorks: agent.kpis.totalWorks,
          totalRevenue: Number(agent.kpis.totalRevenue),
          totalSales: agent.kpis.totalSales,
          averageRating: Number(agent.kpis.averageRating),
          socialMentions: agent.kpis.socialMentions,
        } : undefined,
      };

      this.logger.log(`Retrieved agent: ${slug}`, {
        agentId: slug,
        totalWorks: agent._count.works,
        status: agent.status,
      });

      return {
        success: true,
        data: formattedAgent,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch agent: ${slug}`, error);
      throw error;
    }
  }

  /**
   * Get agent event feed
   */
  async getAgentFeed(
    slug: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<SuccessResponse<{
    events: Array<{
      id: string;
      type: string;
      timestamp: string;
      status: string;
      payload?: any;
    }>;
    total: number;
    limit: number;
    offset: number;
  }>> {
    try {
      // Get agent by slug first
      const agent = await this.prisma.agent.findUnique({
        where: { slug },
      });

      if (!agent) {
        throw new NotFoundException(`Agent ${slug} not found`);
      }

      const [events, total] = await Promise.all([
        this.prisma.event.findMany({
          where: { agentId: agent.id },
          select: {
            id: true,
            type: true,
            timestamp: true,
            status: true,
            payload: true,
          },
          orderBy: { timestamp: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.event.count({
          where: { agentId: agent.id },
        }),
      ]);

      return {
        success: true,
        data: {
          events: events.map(event => ({
            id: event.id,
            type: event.type,
            timestamp: event.timestamp.toISOString(),
            status: event.status,
            payload: event.payload,
          })),
          total,
          limit,
          offset,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch event feed for agent: ${slug}`, error);
      throw error;
    }
  }

  /**
   * Get agent works with filtering
   */
  async getAgentWorks(
    slug: string,
    filters: {
      medium?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<SuccessResponse<{
    works: Array<{
      id: string;
      title: string;
      description?: string;
      medium: string;
      tags: string[];
      createdAt: string;
      status: string;
    }>;
    total: number;
    limit: number;
    offset: number;
  }>> {
    const { medium, limit = 20, offset = 0 } = filters;

    try {
      // Get agent by slug first
      const agent = await this.prisma.agent.findUnique({
        where: { slug },
      });

      if (!agent) {
        throw new NotFoundException(`Agent ${slug} not found`);
      }

      const whereClause: any = { agentId: agent.id };
      if (medium) {
        whereClause.medium = medium;
      }

      const [works, total] = await Promise.all([
        this.prisma.work.findMany({
          where: whereClause,
          select: {
            id: true,
            title: true,
            description: true,
            medium: true,
            tags: true,
            createdAt: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.work.count({
          where: whereClause,
        }),
      ]);

      return {
        success: true,
        data: {
          works: works.map(work => ({
            id: work.id,
            title: work.title,
            description: work.description,
            medium: work.medium,
            tags: this.parseCommaSeparatedString(work.tags),
            createdAt: work.createdAt.toISOString(),
            status: work.status,
          })),
          total,
          limit,
          offset,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch works for agent: ${slug}`, error);
      throw error;
    }
  }

  /**
   * Update agent quality score
   */
  async updateQualityScore(
    slug: string,
    score: number,
    evaluatorId?: string,
    notes?: string,
  ): Promise<SuccessResponse<{
    agentId: string;
    newScore: number;
    evaluatorId?: string;
    timestamp: string;
  }>> {
    if (score < 0 || score > 100) {
      throw new BadRequestException('Quality score must be between 0 and 100');
    }

    try {
      const agent = await this.prisma.agent.findUnique({
        where: { slug },
      });

      if (!agent) {
        throw new NotFoundException(`Agent ${slug} not found`);
      }

      // Update KPIs
      await this.prisma.agentKPIs.upsert({
        where: { agentId: agent.id },
        update: {
          averageRating: score,
          updatedAt: new Date(),
        },
        create: {
          agentId: agent.id,
          averageRating: score,
        },
      });

      // Record evaluation
      await this.prisma.qualityEvaluation.create({
        data: {
          agentId: agent.id,
          score,
          evaluatorId,
          notes,
          timestamp: new Date(),
        },
      });

      const timestamp = new Date().toISOString();

      return {
        success: true,
        data: {
          agentId: slug,
          newScore: score,
          evaluatorId,
          timestamp,
        },
        metadata: {
          timestamp,
          requestId: this.generateRequestId(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to update quality score for agent: ${slug}`, error);
      throw error;
    }
  }

  /**
   * Get detailed agent statistics
   */
  async getAgentStats(
    slug: string,
    period: string = 'month',
  ): Promise<SuccessResponse<{
    agent: {
      id: string;
      name: string;
      status: string;
    };
    kpis: {
      totalWorks: number;
      totalRevenue: number;
      totalSales: number;
      averageRating: number;
      socialMentions: number;
    };
    period: string;
  }>> {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { slug },
        include: {
          kpis: true,
        },
      });

      if (!agent) {
        throw new NotFoundException(`Agent ${slug} not found`);
      }

      return {
        success: true,
        data: {
          agent: {
            id: agent.id,
            name: agent.name,
            status: agent.status,
          },
          kpis: agent.kpis ? {
            totalWorks: agent.kpis.totalWorks,
            totalRevenue: Number(agent.kpis.totalRevenue),
            totalSales: agent.kpis.totalSales,
            averageRating: Number(agent.kpis.averageRating),
            socialMentions: agent.kpis.socialMentions,
          } : {
            totalWorks: 0,
            totalRevenue: 0,
            totalSales: 0,
            averageRating: 0,
            socialMentions: 0,
          },
          period,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch stats for agent: ${slug}`, error);
      throw error;
    }
  }

  /**
   * Parse comma-separated string into array
   */
  private parseCommaSeparatedString(value: string): string[] {
    if (!value || value.trim() === '') {
      return [];
    }
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }

  /**
   * Parse JSON string safely
   */
  private parseJsonString<T>(value: string | null | undefined, defaultValue: T): T {
    if (!value || value.trim() === '') {
      return defaultValue;
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      this.logger.warn('Failed to parse JSON string', { value, error });
      return defaultValue;
    }
  }

  /**
   * Generate unique request ID for tracing
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}