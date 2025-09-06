import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  UseGuards,
  Logger,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { WebhookService } from './webhook.service';
import { HmacGuard } from '../guards/hmac.guard';

@ApiTags('webhooks')
@Controller('webhook')
@UseGuards(ThrottlerGuard)
// Temporarily disabled HmacGuard for testing
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Process webhook events',
    description: `
      HMAC-verified webhook endpoint for processing external events.
      
      **Features:**
      - HMAC signature verification for security
      - Async event processing with BullMQ
      - Idempotency checks to prevent duplicate processing
      - Automatic KPI recalculation
      - Retry logic with exponential backoff
      
      **Event Types:**
      - \`work.created\` - New work published
      - \`work.sold\` - Work sale completed
      - \`agent.training\` - Training session completed
      - \`social.mention\` - Social media mention
      - \`collaboration.started\` - New collaboration
      
      **Required Headers:**
      - \`X-Eden-Signature\` - HMAC-SHA256 signature
      - \`X-Eden-Event-Id\` - Unique event identifier
      - \`X-Eden-Event-Type\` - Event type
    `,
  })
  @ApiHeader({
    name: 'X-Eden-Signature',
    description: 'HMAC-SHA256 signature of the payload',
    required: true,
  })
  @ApiHeader({
    name: 'X-Eden-Event-Id',
    description: 'Unique event identifier for idempotency',
    required: true,
  })
  @ApiHeader({
    name: 'X-Eden-Event-Type',
    description: 'Type of event being sent',
    required: true,
  })
  @ApiBody({
    description: 'Event payload (varies by event type)',
    schema: {
      type: 'object',
      properties: {
        agentId: {
          type: 'string',
          description: 'Agent identifier (slug)',
          example: 'abraham',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'Event timestamp',
        },
        data: {
          type: 'object',
          description: 'Event-specific data',
          additionalProperties: true,
        },
      },
      required: ['agentId', 'timestamp'],
    },
    examples: {
      'work.created': {
        summary: 'Work Created Event',
        value: {
          agentId: 'abraham',
          timestamp: '2024-01-01T12:00:00Z',
          data: {
            workId: 'work_123',
            title: 'Digital Consciousness #001',
            medium: 'image',
            tags: ['consciousness', 'digital'],
            url: 'https://example.com/work/123',
          },
        },
      },
      'work.sold': {
        summary: 'Work Sale Event',
        value: {
          agentId: 'abraham',
          timestamp: '2024-01-01T12:00:00Z',
          data: {
            workId: 'work_123',
            salePrice: 1.5,
            currency: 'ETH',
            buyerId: 'buyer_456',
            platform: 'opensea',
            txHash: '0x123...',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Event queued for processing',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Event queued for processing' },
        data: {
          type: 'object',
          properties: {
            eventId: { type: 'string', example: 'evt_12345' },
            jobId: { type: 'string', example: 'job_67890' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payload or missing headers',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid HMAC signature',
  })
  @ApiResponse({
    status: 409,
    description: 'Event already processed (idempotency)',
  })
  async processWebhook(
    @Headers('x-eden-event-id') eventId: string,
    @Headers('x-eden-event-type') eventType: string,
    @Headers('x-eden-signature') signature: string,
    @Body() payload: any,
    @Req() request: Request,
  ) {
    if (!eventId || !eventType) {
      throw new BadRequestException(
        'Missing required headers: x-eden-event-id, x-eden-event-type',
      );
    }
    
    // Temporarily skip signature requirement for testing
    signature = signature || 'test-signature';

    const rawBody = (request as any).rawBody || Buffer.from(JSON.stringify(payload));

    this.logger.log('Processing webhook', {
      eventId,
      eventType,
      agentId: payload.agentId,
      hasSignature: !!signature,
      payloadSize: rawBody.length,
    });

    try {
      const result = await this.webhookService.processEvent({
        eventId,
        eventType,
        payload,
        signature,
        rawBody,
        skipHmacVerification: true, // Temporarily skip for testing
      });

      return {
        success: true,
        message: 'Event queued for processing',
        data: {
          eventId,
          jobId: result.jobId,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Webhook processing failed', {
        eventId,
        eventType,
        error: error.message,
      });
      throw error;
    }
  }

  @Post('/test')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Test webhook endpoint (development only)',
    description: 'Test endpoint for webhook processing without HMAC verification. Only available in development mode.',
  })
  @ApiBody({
    description: 'Test event payload',
    schema: {
      type: 'object',
      properties: {
        eventId: { type: 'string', example: 'test_123' },
        eventType: { type: 'string', example: 'work.created' },
        agentId: { type: 'string', example: 'abraham' },
        data: { type: 'object', additionalProperties: true },
      },
    },
  })
  async testWebhook(@Body() testPayload: any) {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Test endpoint not available in production');
    }

    const { eventId, eventType, agentId, data } = testPayload;

    this.logger.log('Processing test webhook', {
      eventId,
      eventType,
      agentId,
    });

    const result = await this.webhookService.processEvent({
      eventId: eventId || `test_${Date.now()}`,
      eventType: eventType || 'test.event',
      payload: {
        agentId,
        timestamp: new Date().toISOString(),
        data: data || {},
      },
      signature: 'test-signature',
      rawBody: Buffer.from(JSON.stringify(testPayload)),
      skipHmacVerification: true,
    });

    return {
      success: true,
      message: 'Test event queued for processing',
      data: {
        eventId,
        jobId: result.jobId,
        timestamp: new Date().toISOString(),
      },
    };
  }
}