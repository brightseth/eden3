import { 
  Controller, 
  Get, 
  Post,
  Param, 
  Query, 
  Body,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiParam, 
  ApiQuery, 
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AgentsService } from './agents.service';
import { EdenSyncService } from '../sync/eden-sync.service';
import { SyncSchedulerService } from '../sync/sync-scheduler.service';
// import { AgentId } from '@eden3/core'; // Temporarily disabled due to type conflicts
type AgentId = string;

@ApiTags('agents')
@Controller('agents')
@UseGuards(ThrottlerGuard)
export class AgentsController {
  private readonly logger = new Logger(AgentsController.name);

  constructor(
    private readonly agentsService: AgentsService,
    private readonly edenSyncService: EdenSyncService,
    private readonly syncSchedulerService: SyncSchedulerService,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all agents with filtering and pagination',
    description: `
      Retrieve all EDEN3 agents with comprehensive filtering options.
      
      **Features:**
      - Filter by status, type, capabilities, and source
      - Pagination with limit/offset
      - Full KPIs and metadata included
      - Real-time activity status
      - Multi-source agent support (claude-sdk, eden-legacy, eden3-native)
    `,
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['active', 'training', 'maintenance', 'retired'],
    description: 'Filter by agent status' 
  })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    description: 'Filter by agent type/archetype' 
  })
  @ApiQuery({ 
    name: 'source', 
    required: false, 
    enum: ['all', 'claude-sdk', 'eden-legacy', 'eden3-native'],
    description: 'Filter by agent source (default: all)' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number,
    description: 'Number of agents to return (default: 20, max: 100)' 
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    type: Number,
    description: 'Number of agents to skip (default: 0)' 
  })
  @ApiResponse({
    status: 200,
    description: 'List of agents with KPIs and metadata',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            agents: {
              type: 'array',
              items: { $ref: '#/components/schemas/Agent' },
            },
            total: { type: 'number', example: 10 },
            limit: { type: 'number', example: 20 },
            offset: { type: 'number', example: 0 },
          },
        },
        metadata: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            requestId: { type: 'string' },
          },
        },
      },
    },
  })
  async findAll(
    @Query('status') status?: 'active' | 'training' | 'maintenance' | 'retired',
    @Query('type') type?: string,
    @Query('source') source?: 'all' | 'claude-sdk' | 'eden-legacy' | 'eden3-native',
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number = 0,
  ) {
    // Validate limits
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const validatedOffset = Math.max(0, offset);

    this.logger.log(`Fetching agents with filters`, {
      status,
      type,
      source,
      limit: validatedLimit,
      offset: validatedOffset,
    });

    return this.agentsService.findAll({
      status,
      type,
      source: source || 'all',
      limit: validatedLimit,
      offset: validatedOffset,
    });
  }

  @Get(':slug')
  @ApiOperation({ 
    summary: 'Get agent by slug with complete details',
    description: `
      Get comprehensive details for a specific agent including:
      - Basic information and personality
      - Real-time KPIs and performance metrics
      - Recent activity and status
      - Capabilities and configuration
    `,
  })
  @ApiParam({ 
    name: 'slug', 
    description: 'Agent slug identifier',
    enum: ['abraham', 'solienne', 'citizen', 'miyomi', 'bertha', 'geppetto', 'koru', 'sue', 'verdelis', 'bart'],
    example: 'abraham',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent details with KPIs',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/Agent' },
        metadata: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            requestId: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Agent not found',
  })
  async findOne(@Param('slug') slug: string) {
    this.logger.log(`Fetching agent: ${slug}`);
    return this.agentsService.findBySlug(slug);
  }

  @Get(':slug/feed')
  @ApiOperation({ 
    summary: 'Get agent event feed',
    description: 'Retrieve recent events and activities for the agent in chronological order.',
  })
  @ApiParam({ name: 'slug', description: 'Agent slug' })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number,
    description: 'Number of events to return (default: 50, max: 200)' 
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    type: Number,
    description: 'Number of events to skip (default: 0)' 
  })
  async getFeed(
    @Param('slug') slug: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number = 50,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number = 0,
  ) {
    const validatedLimit = Math.min(Math.max(1, limit), 200);
    const validatedOffset = Math.max(0, offset);

    return this.agentsService.getAgentFeed(slug, validatedLimit, validatedOffset);
  }

  @Get(':slug/works')
  @ApiOperation({ 
    summary: 'Get agent works and creations',
    description: 'Retrieve all works created by the agent with optional filtering.',
  })
  @ApiParam({ name: 'slug', description: 'Agent slug' })
  @ApiQuery({ 
    name: 'medium', 
    required: false, 
    enum: ['image', 'video', 'audio', 'text', 'interactive', 'mixed'],
    description: 'Filter works by medium type' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number,
    description: 'Number of works to return (default: 20, max: 100)' 
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    type: Number,
    description: 'Number of works to skip (default: 0)' 
  })
  async getWorks(
    @Param('slug') slug: string,
    @Query('medium') medium?: 'image' | 'video' | 'audio' | 'text' | 'interactive' | 'mixed',
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number = 0,
  ) {
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const validatedOffset = Math.max(0, offset);

    return this.agentsService.getAgentWorks(slug, {
      medium,
      limit: validatedLimit,
      offset: validatedOffset,
    });
  }

  @Post(':slug/rubric')
  @ApiOperation({ 
    summary: 'Update agent quality score',
    description: `
      Update the agent's quality score based on evaluation criteria.
      This affects the agent's average rating in KPIs.
    `,
  })
  @ApiParam({ name: 'slug', description: 'Agent slug' })
  @ApiBody({
    description: 'Quality score and evaluation details',
    schema: {
      type: 'object',
      required: ['score'],
      properties: {
        score: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Quality score from 0-100',
          example: 87.5,
        },
        evaluatorId: {
          type: 'string',
          description: 'ID of the evaluator (optional)',
          example: 'trainer-001',
        },
        notes: {
          type: 'string',
          description: 'Evaluation notes (optional)',
          example: 'Excellent creativity and technical execution',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Quality score updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Quality score updated successfully' },
        data: {
          type: 'object',
          properties: {
            agentId: { type: 'string', example: 'abraham' },
            newScore: { type: 'number', example: 87.5 },
            evaluatorId: { type: 'string', example: 'trainer-001' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async updateRubric(
    @Param('slug') slug: string,
    @Body() body: {
      score: number;
      evaluatorId?: string;
      notes?: string;
    },
  ) {
    const { score, evaluatorId, notes } = body;
    
    this.logger.log(`Updating quality score for agent ${slug}`, {
      agentId: slug,
      score,
      evaluatorId,
      hasNotes: !!notes,
    });

    return this.agentsService.updateQualityScore(slug, score, evaluatorId, notes);
  }

  @Get(':slug/stats')
  @ApiOperation({ 
    summary: 'Get detailed agent statistics',
    description: 'Comprehensive analytics and performance metrics for the agent.',
  })
  @ApiParam({ name: 'slug', description: 'Agent slug' })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    enum: ['day', 'week', 'month', 'year', 'all'],
    description: 'Time period for statistics (default: month)' 
  })
  async getStats(
    @Param('slug') slug: string,
    @Query('period') period: 'day' | 'week' | 'month' | 'year' | 'all' = 'month',
  ) {
    return this.agentsService.getAgentStats(slug, period);
  }

  @Post('sync-eden')
  @ApiOperation({ 
    summary: 'Synchronize agents from Eden Legacy',
    description: `
      Manually trigger synchronization of agents from the Eden Legacy platform.
      
      **Features:**
      - Fetches latest agent data from Eden.art API
      - Updates existing agents or creates new ones
      - Preserves source identity and external IDs
      - Returns sync statistics and any errors
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Synchronization completed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Eden Legacy synchronization completed' },
        data: {
          type: 'object',
          properties: {
            synced: { type: 'number', example: 3 },
            failed: { type: 'number', example: 0 },
            errors: { 
              type: 'array',
              items: { type: 'string' },
              example: []
            },
          },
        },
        metadata: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            requestId: { type: 'string' },
          },
        },
      },
    },
  })
  async syncEdenAgents() {
    this.logger.log('Manual Eden Legacy synchronization requested');
    
    const syncResult = await this.edenSyncService.syncEdenAgents();
    
    return {
      success: syncResult.success,
      message: 'Eden Legacy synchronization completed',
      data: syncResult,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: `sync_${Date.now()}`,
      },
    };
  }

  @Get('sync/status')
  @ApiOperation({ 
    summary: 'Get sync scheduler status',
    description: `
      Get the current status of the automated synchronization scheduler.
      
      **Features:**
      - Shows whether scheduler is enabled/disabled
      - Next scheduled sync time
      - Active sync jobs
      - Configuration details
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Sync scheduler status',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', example: true },
            edenLegacyInterval: { type: 'string', example: '0 */30 * * * *' },
            nextEdenLegacyRun: { type: 'string', format: 'date-time' },
            jobs: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['eden-legacy-sync']
            },
          },
        },
        metadata: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            requestId: { type: 'string' },
          },
        },
      },
    },
  })
  async getSyncStatus() {
    this.logger.log('Fetching sync scheduler status');
    
    const status = this.syncSchedulerService.getSchedulerStatus();
    
    return {
      success: true,
      data: status,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: `status_${Date.now()}`,
      },
    };
  }

  @Post('sync/trigger')
  @ApiOperation({ 
    summary: 'Manually trigger Eden Legacy synchronization',
    description: `
      Manually trigger an immediate synchronization with Eden Legacy platform.
      This bypasses the scheduled sync and runs immediately.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Manual sync triggered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Manual sync completed successfully' },
        data: {
          type: 'object',
          properties: {
            synced: { type: 'number', example: 3 },
            failed: { type: 'number', example: 0 },
            errors: { 
              type: 'array',
              items: { type: 'string' },
              example: []
            },
          },
        },
        metadata: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            requestId: { type: 'string' },
          },
        },
      },
    },
  })
  async triggerSync() {
    this.logger.log('Manual sync trigger requested via scheduler service');
    
    const result = await this.syncSchedulerService.triggerEdenLegacySync();
    
    return {
      ...result,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: `trigger_${Date.now()}`,
      },
    };
  }
}