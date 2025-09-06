import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../database/prisma.service';

@ApiTags('webhooks')
@Controller('webhook-stats')
@UseGuards(ThrottlerGuard)
export class WebhookStatsController {
  private readonly logger = new Logger(WebhookStatsController.name);

  constructor(
    private readonly webhookService: WebhookService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get webhook processing statistics',
    description: 'Retrieve comprehensive statistics about webhook event processing.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processing statistics',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            events: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 1234 },
                pending: { type: 'number', example: 5 },
                processing: { type: 'number', example: 2 },
                completed: { type: 'number', example: 1200 },
                failed: { type: 'number', example: 27 },
              },
            },
            recentEvents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string' },
                  status: { type: 'string' },
                  agentId: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' },
                  attempts: { type: 'number' },
                },
              },
            },
            errorSummary: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  eventType: { type: 'string' },
                  errorCount: { type: 'number' },
                  lastError: { type: 'string' },
                },
              },
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
  async getStats() {
    try {
      const [eventStats, recentEvents, errorSummary] = await Promise.all([
        // Get event status counts
        this.webhookService.getEventStats(),
        
        // Get recent events (last 50)
        this.prisma.event.findMany({
          select: {
            id: true,
            eventId: true,
            type: true,
            status: true,
            agentId: true,
            timestamp: true,
            attempts: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        
        // Get error summary by event type
        this.prisma.event.groupBy({
          by: ['type'],
          where: {
            status: 'FAILED',
          },
          _count: {
            type: true,
          },
          orderBy: {
            _count: {
              type: 'desc',
            },
          },
          take: 10,
        }),
      ]);

      // Get latest error messages for each event type
      const errorDetails = await Promise.all(
        errorSummary.map(async (summary) => {
          const latestError = await this.prisma.event.findFirst({
            where: {
              type: summary.type,
              status: 'FAILED',
              errorMessage: { not: null },
            },
            orderBy: { createdAt: 'desc' },
            select: { errorMessage: true },
          });

          return {
            eventType: summary.type,
            errorCount: summary._count.type,
            lastError: latestError?.errorMessage || 'No error message',
          };
        })
      );

      return {
        success: true,
        data: {
          events: eventStats,
          recentEvents: recentEvents.map(event => ({
            id: event.eventId,
            type: event.type,
            status: event.status,
            agentId: event.agentId,
            timestamp: event.timestamp.toISOString(),
            attempts: event.attempts,
          })),
          errorSummary: errorDetails,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch webhook statistics', error);
      throw error;
    }
  }

  @Get('/health')
  @ApiOperation({
    summary: 'Get webhook system health',
    description: 'Check the health of the webhook processing system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook system health status',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'healthy' },
            queueHealth: {
              type: 'object',
              properties: {
                waiting: { type: 'number', example: 0 },
                active: { type: 'number', example: 1 },
                completed: { type: 'number', example: 1234 },
                failed: { type: 'number', example: 5 },
              },
            },
            processingRate: {
              type: 'object',
              properties: {
                eventsPerMinute: { type: 'number', example: 45.2 },
                avgProcessingTime: { type: 'number', example: 1.34 },
                successRate: { type: 'number', example: 98.5 },
              },
            },
          },
        },
      },
    },
  })
  @ApiBearerAuth()
  async getHealth() {
    try {
      // Get recent processing metrics (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const [recentEvents, recentStats] = await Promise.all([
        this.prisma.event.count({
          where: {
            createdAt: { gte: oneHourAgo },
          },
        }),
        this.prisma.event.groupBy({
          by: ['status'],
          where: {
            createdAt: { gte: oneHourAgo },
          },
          _count: {
            status: true,
          },
        }),
      ]);

      const statsMap = recentStats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count.status;
        return acc;
      }, {} as Record<string, number>);

      const totalRecent = recentEvents;
      const completed = statsMap.completed || 0;
      const failed = statsMap.failed || 0;
      const successRate = totalRecent > 0 ? ((completed / totalRecent) * 100) : 100;

      return {
        success: true,
        data: {
          status: successRate > 95 ? 'healthy' : successRate > 85 ? 'degraded' : 'unhealthy',
          queueHealth: {
            waiting: statsMap.pending || 0,
            active: statsMap.processing || 0,
            completed: completed,
            failed: failed,
          },
          processingRate: {
            eventsPerMinute: Math.round((totalRecent / 60) * 100) / 100,
            avgProcessingTime: 1.5, // Placeholder - would need actual timing data
            successRate: Math.round(successRate * 100) / 100,
          },
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch webhook health', error);
      throw error;
    }
  }
}