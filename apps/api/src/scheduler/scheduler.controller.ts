import { Controller, Post, Get, Param, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AgentActivitiesService } from './agent-activities.service';

@ApiTags('Scheduler')
@Controller('scheduler')
export class SchedulerController {
  private readonly logger = new Logger(SchedulerController.name);

  constructor(private readonly agentActivitiesService: AgentActivitiesService) {}

  /**
   * Manual trigger endpoint for immediate content generation
   */
  @Post('agents/:slug/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Generate content for specific agent',
    description: 'Manually trigger immediate content generation for a specific agent'
  })
  @ApiParam({
    name: 'slug',
    description: 'Agent slug (abraham, miyomi, solienne)',
    example: 'abraham'
  })
  @ApiResponse({
    status: 200,
    description: 'Content generation triggered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        workId: { type: 'string' },
        timestamp: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid agent slug or generation failed'
  })
  async generateContent(@Param('slug') slug: string) {
    this.logger.log(`Manual generation request for agent: ${slug}`);
    
    const result = await this.agentActivitiesService.generateContentForAgent(slug);
    
    return {
      ...result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get scheduler status and statistics
   */
  @Get('status')
  @ApiOperation({ 
    summary: 'Get scheduler status',
    description: 'Returns current scheduler status, schedules, and generation statistics'
  })
  @ApiResponse({
    status: 200,
    description: 'Scheduler status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        active: { type: 'boolean' },
        nextRuns: {
          type: 'object',
          properties: {
            abraham: { type: 'string' },
            miyomi: { type: 'string' },
            solienne: { type: 'string' }
          }
        },
        totalGenerated: { type: 'number' }
      }
    }
  })
  async getSchedulerStatus() {
    return await this.agentActivitiesService.getSchedulerStatus();
  }

  /**
   * Trigger all scheduled content generation at once (for testing)
   */
  @Post('generate-all')
  @HttpCode(HttpStatus.OK) 
  @ApiOperation({
    summary: 'Generate content for all agents',
    description: 'Manually trigger content generation for all configured agents (Abraham, Miyomi, Solienne)'
  })
  @ApiResponse({
    status: 200,
    description: 'Content generation triggered for all agents',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        results: {
          type: 'object',
          properties: {
            abraham: { type: 'object' },
            miyomi: { type: 'object' },
            solienne: { type: 'object' }
          }
        },
        timestamp: { type: 'string' }
      }
    }
  })
  async generateAllContent() {
    this.logger.log('Manual generation request for all agents');

    const results = {
      abraham: await this.agentActivitiesService.generateContentForAgent('abraham'),
      miyomi: await this.agentActivitiesService.generateContentForAgent('miyomi'),
      solienne: await this.agentActivitiesService.generateContentForAgent('solienne')
    };

    const overallSuccess = Object.values(results).every(result => result.success);

    return {
      success: overallSuccess,
      results,
      timestamp: new Date().toISOString()
    };
  }
}