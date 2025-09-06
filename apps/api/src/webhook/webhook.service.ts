import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../database/prisma.service';
import { HmacService } from '../security/hmac.service';

export interface WebhookEventData {
  eventId: string;
  eventType: string;
  payload: any;
  signature: string;
  rawBody: Buffer;
  skipHmacVerification?: boolean;
  source?: string; // 'claude-sdk' | 'eden-legacy' | 'eden3-native'
}

export interface EventJobData {
  eventId: string;
  eventType: string;
  agentId: string;
  payload: any;
  timestamp: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectQueue('events') private readonly eventQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly hmacService: HmacService,
  ) {}

  /**
   * Process incoming webhook event
   */
  async processEvent(eventData: WebhookEventData): Promise<{ jobId: string }> {
    const { eventId, eventType, payload, signature, rawBody, skipHmacVerification = false, source = 'eden3-native' } = eventData;

    // Verify HMAC signature (skip for test events)
    if (!skipHmacVerification) {
      const isValid = await this.hmacService.verifySignature(rawBody, signature);
      if (!isValid) {
        throw new Error('Invalid HMAC signature');
      }
    }

    // Check for duplicate events (idempotency)
    const existingEvent = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (existingEvent) {
      this.logger.warn(`Event ${eventId} already processed`, {
        eventId,
        eventType,
        status: existingEvent.status,
      });
      throw new ConflictException(`Event ${eventId} already processed`);
    }

    // Validate payload
    if (!payload.agentId) {
      throw new Error('Missing agentId in payload');
    }

    // Create event record
    const event = await this.prisma.event.create({
      data: {
        eventId,
        type: eventType,
        agentId: await this.getAgentIdBySlug(payload.agentId, source),
        payload: JSON.stringify(payload), // Convert payload to JSON string for SQLite
        metadata: JSON.stringify({ source, originalAgentId: payload.agentId }), // Store source information
        timestamp: new Date(payload.timestamp || new Date()),
        status: 'PENDING',
      },
    });

    // Queue for async processing
    const job = await this.eventQueue.add('processEvent', {
      eventId,
      eventType,
      agentId: payload.agentId,
      payload,
      timestamp: payload.timestamp || new Date().toISOString(),
    } as EventJobData, {
      jobId: `job_${eventId}`,
      delay: 0,
    });

    this.logger.log('Event queued for processing', {
      eventId,
      eventType,
      agentId: payload.agentId,
      jobId: job.id,
      dbEventId: event.id,
    });

    return { jobId: job.id as string };
  }

  /**
   * Get agent database ID by slug with source-aware lookup
   */
  private async getAgentIdBySlug(slug: string, source: string = 'eden3-native'): Promise<string> {
    // First try exact slug match
    let agent = await this.prisma.agent.findUnique({
      where: { slug },
      select: { id: true },
    });

    // If not found and source is eden-legacy, try with eden- prefix
    if (!agent && source === 'eden-legacy' && !slug.startsWith('eden-')) {
      const prefixedSlug = `eden-${slug}`;
      agent = await this.prisma.agent.findUnique({
        where: { slug: prefixedSlug },
        select: { id: true },
      });
    }

    // If still not found, try finding by source and externalId for legacy agents
    if (!agent && source === 'eden-legacy') {
      // Find agents that have eden-legacy in their sources array
      const agents = await this.prisma.agent.findMany({
        select: { 
          id: true,
          sources: true,
          externalIds: true 
        },
      });
      
      // Find agent where sources includes eden-legacy and externalId matches
      agent = agents.find(a => {
        const sources = JSON.parse(a.sources || '[]');
        const externalIds = JSON.parse(a.externalIds || '{}');
        return sources.includes('eden-legacy') && externalIds['eden-legacy'] === slug;
      }) || null;
    }

    if (!agent) {
      throw new Error(`Agent ${slug} not found for source ${source}`);
    }

    return agent.id;
  }

  /**
   * Update event processing status
   */
  async updateEventStatus(
    eventId: string, 
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED',
    errorMessage?: string,
  ): Promise<void> {
    await this.prisma.event.update({
      where: { eventId },
      data: {
        status,
        errorMessage,
        updatedAt: new Date(),
      },
    });

    if (status === 'FAILED') {
      await this.prisma.event.update({
        where: { eventId },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });
    }
  }

  /**
   * Get event processing stats
   */
  async getEventStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const stats = await this.prisma.event.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const result = {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    stats.forEach(stat => {
      result.total += stat._count.status;
      result[stat.status.toLowerCase() as keyof typeof result] = stat._count.status;
    });

    return result;
  }
}