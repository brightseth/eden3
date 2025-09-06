import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../database/prisma.service';
import { WebhookService, EventJobData } from '../webhook.service';

@Processor('events')
export class EventProcessor {
  private readonly logger = new Logger(EventProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhookService: WebhookService,
  ) {}

  @Process('processEvent')
  async processEvent(job: Job<EventJobData>) {
    const { eventId, eventType, agentId, payload, timestamp } = job.data;

    this.logger.log('Processing event', {
      eventId,
      eventType,
      agentId,
      jobId: job.id,
    });

    try {
      // Update status to processing
      await this.webhookService.updateEventStatus(eventId, 'PROCESSING');

      // Get agent
      const agent = await this.prisma.agent.findUnique({
        where: { slug: agentId },
        include: { kpis: true },
      });

      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      // Process based on event type
      switch (eventType) {
        case 'work.created':
          await this.processWorkCreated(agent.id, payload, timestamp);
          break;
        case 'work.sold':
          await this.processWorkSold(agent.id, payload, timestamp);
          break;
        case 'agent.training':
          await this.processTrainingSession(agent.id, payload, timestamp);
          break;
        case 'social.mention':
          await this.processSocialMention(agent.id, payload, timestamp);
          break;
        case 'collaboration.started':
          await this.processCollaboration(agent.id, payload, timestamp);
          break;
        case 'quality.evaluation':
          await this.processQualityEvaluation(agent.id, payload, timestamp);
          break;
        default:
          this.logger.warn(`Unknown event type: ${eventType}`, { eventId, eventType });
      }

      // Recalculate KPIs
      await this.recalculateKPIs(agent.id);

      // Update status to completed
      await this.webhookService.updateEventStatus(eventId, 'COMPLETED');

      this.logger.log('Event processed successfully', {
        eventId,
        eventType,
        agentId,
        jobId: job.id,
      });

    } catch (error) {
      this.logger.error('Event processing failed', {
        eventId,
        eventType,
        agentId,
        jobId: job.id,
        error: error.message,
        stack: error.stack,
      });

      // Update status to failed
      await this.webhookService.updateEventStatus(eventId, 'FAILED', error.message);

      // Re-throw to trigger Bull retry logic
      throw error;
    }
  }

  /**
   * Process work creation event
   */
  private async processWorkCreated(agentId: string, data: any, timestamp: string) {
    const {
      workId,
      title,
      description,
      content,
      contentType,
      contentMetadata,
      medium,
      tags = [],
      url,
      thumbnailUrl,
      aiModel,
      promptUsed,
      generationTime,
    } = data;

    await this.prisma.work.create({
      data: {
        id: workId || undefined,
        agentId,
        title,
        description,
        content,
        contentType: contentType || 'TEXT',
        contentMetadata: contentMetadata ? JSON.stringify(contentMetadata) : null,
        medium: medium || 'unknown',
        tags,
        contentUrl: url,
        thumbnailUrl,
        aiModel,
        promptUsed,
        generationTime: generationTime ? parseFloat(generationTime) : null,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        createdAt: new Date(timestamp),
        publishedAt: new Date(timestamp),
      },
    });

    this.logger.log(`Work created: ${title}`, { agentId, workId, medium });
  }

  /**
   * Process work sale event
   */
  private async processWorkSold(agentId: string, data: any, timestamp: string) {
    const {
      workId,
      salePrice,
      currency = 'ETH',
      buyerId,
      platform,
      txHash,
      blockNumber,
      gasUsed,
      royaltyAmount,
    } = data;

    // Update work status
    const work = await this.prisma.work.update({
      where: { id: workId },
      data: {
        status: 'SOLD',
        salePrice: parseFloat(salePrice),
        currency,
        buyerId,
        platform,
        soldAt: new Date(timestamp),
        grossRevenue: parseFloat(salePrice),
        netRevenue: royaltyAmount ? parseFloat(salePrice) - parseFloat(royaltyAmount) : parseFloat(salePrice),
      },
    });

    // Create transaction record
    await this.prisma.transaction.create({
      data: {
        workId,
        type: 'SALE',
        amount: parseFloat(salePrice),
        currency,
        buyerId,
        platform,
        royaltyAmount: royaltyAmount ? parseFloat(royaltyAmount) : null,
        txHash,
        blockNumber: blockNumber ? parseInt(blockNumber) : null,
        gasUsed: gasUsed ? parseInt(gasUsed) : null,
        timestamp: new Date(timestamp),
      },
    });

    this.logger.log(`Work sold: ${work.title}`, { 
      agentId, 
      workId, 
      salePrice, 
      currency, 
      platform 
    });
  }

  /**
   * Process training session event
   */
  private async processTrainingSession(agentId: string, data: any, timestamp: string) {
    const {
      sessionId,
      trainerId,
      sessionType,
      duration,
      feedbackScore,
      improvements = [],
      notes,
    } = data;

    await this.prisma.trainingSession.create({
      data: {
        id: sessionId || undefined,
        agentId,
        trainerId,
        sessionType,
        duration: duration ? parseInt(duration) : null,
        feedbackScore: feedbackScore ? parseFloat(feedbackScore) : null,
        improvements,
        notes,
        timestamp: new Date(timestamp),
      },
    });

    this.logger.log(`Training session completed`, { 
      agentId, 
      trainerId, 
      sessionType, 
      duration 
    });
  }

  /**
   * Process social mention event
   */
  private async processSocialMention(agentId: string, data: any, timestamp: string) {
    const {
      platform,
      author,
      content,
      url,
      sentiment,
      reach,
    } = data;

    await this.prisma.mention.create({
      data: {
        agentId,
        platform,
        author,
        content,
        url,
        sentiment,
        reach: reach ? parseInt(reach) : null,
        timestamp: new Date(timestamp),
      },
    });

    this.logger.log(`Social mention tracked`, { 
      agentId, 
      platform, 
      author, 
      sentiment 
    });
  }

  /**
   * Process collaboration event
   */
  private async processCollaboration(agentId: string, data: any, timestamp: string) {
    const {
      partnerAgentId,
      type,
      description,
      workId,
    } = data;

    await this.prisma.collaboration.create({
      data: {
        agentId,
        partnerAgentId,
        type,
        description,
        workId,
        timestamp: new Date(timestamp),
      },
    });

    this.logger.log(`Collaboration started`, { 
      agentId, 
      partnerAgentId, 
      type 
    });
  }

  /**
   * Process quality evaluation event
   */
  private async processQualityEvaluation(agentId: string, data: any, timestamp: string) {
    const {
      score,
      evaluatorId,
      notes,
    } = data;

    await this.prisma.qualityEvaluation.create({
      data: {
        agentId,
        score: parseFloat(score),
        evaluatorId,
        notes,
        timestamp: new Date(timestamp),
      },
    });

    this.logger.log(`Quality evaluation recorded`, { 
      agentId, 
      score, 
      evaluatorId 
    });
  }

  /**
   * Recalculate agent KPIs based on latest data
   */
  private async recalculateKPIs(agentId: string) {
    const [
      totalWorks,
      totalSales,
      totalRevenue,
      avgRating,
      socialMentions,
      totalTrainingSessions,
      totalCollaborations,
      lastActivity,
      lastTraining,
    ] = await Promise.all([
      // Total works count
      this.prisma.work.count({
        where: { agentId, status: { in: ['PUBLISHED', 'SOLD'] } },
      }),
      // Total sales count
      this.prisma.work.count({
        where: { agentId, status: 'SOLD' },
      }),
      // Total revenue
      this.prisma.work.aggregate({
        where: { agentId, status: 'SOLD' },
        _sum: { grossRevenue: true },
      }).then(result => result._sum.grossRevenue || 0),
      // Average rating from quality evaluations
      this.prisma.qualityEvaluation.aggregate({
        where: { agentId },
        _avg: { score: true },
      }).then(result => result._avg.score || 0),
      // Social mentions count
      this.prisma.mention.count({
        where: { agentId },
      }),
      // Training sessions count
      this.prisma.trainingSession.count({
        where: { agentId },
      }),
      // Collaborations count
      this.prisma.collaboration.count({
        where: { agentId },
      }),
      // Last activity (most recent event)
      this.prisma.event.findFirst({
        where: { agentId },
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      }).then(result => result?.timestamp || null),
      // Last training session
      this.prisma.trainingSession.findFirst({
        where: { agentId },
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      }).then(result => result?.timestamp || null),
    ]);

    // Update or create KPIs record
    await this.prisma.agentKPIs.upsert({
      where: { agentId },
      update: {
        totalWorks,
        totalSales,
        totalRevenue,
        averageRating: avgRating,
        socialMentions,
        totalTrainingSessions,
        totalCollaborations,
        lastActivity,
        lastTraining,
        updatedAt: new Date(),
      },
      create: {
        agentId,
        totalWorks,
        totalSales,
        totalRevenue,
        averageRating: avgRating,
        socialMentions,
        totalTrainingSessions,
        totalCollaborations,
        lastActivity,
        lastTraining,
      },
    });

    // Update denormalized fields on agent record
    await this.prisma.agent.update({
      where: { id: agentId },
      data: {
        kQuality: avgRating,
        kRevenue: totalRevenue,
        kMentions: socialMentions,
        updatedAt: new Date(),
      },
    });

    this.logger.log('KPIs recalculated', {
      agentId,
      totalWorks,
      totalSales,
      totalRevenue: Number(totalRevenue),
      avgRating: Number(avgRating),
      socialMentions,
    });
  }
}