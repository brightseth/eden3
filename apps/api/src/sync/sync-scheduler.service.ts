import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { EdenSyncService } from './eden-sync.service';

export interface SyncScheduleConfig {
  edenLegacyInterval: string; // Cron expression for Eden Legacy sync
  enabled: boolean;
}

@Injectable()
export class SyncSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SyncSchedulerService.name);
  
  private readonly config: SyncScheduleConfig = {
    // Sync every 30 minutes
    edenLegacyInterval: process.env.EDEN_SYNC_CRON || '0 */30 * * * *',
    // Disabled by default in production, enabled by default in development
    enabled: process.env.EDEN_SYNC_ENABLED === 'true' || (process.env.NODE_ENV !== 'production' && process.env.EDEN_SYNC_ENABLED !== 'false'),
  };

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly edenSyncService: EdenSyncService,
  ) {}

  async onModuleInit() {
    if (!this.config.enabled) {
      this.logger.log('Sync scheduler disabled by configuration');
      return;
    }

    this.logger.log('Initializing sync scheduler', {
      edenLegacyInterval: this.config.edenLegacyInterval,
      enabled: this.config.enabled,
    });

    await this.setupEdenLegacySync();
    this.logger.log('Sync scheduler initialized successfully');
  }

  async onModuleDestroy() {
    if (!this.config.enabled) {
      return;
    }

    this.logger.log('Shutting down sync scheduler');
    
    try {
      const job = this.schedulerRegistry.getCronJob('eden-legacy-sync');
      job.stop();
      this.schedulerRegistry.deleteCronJob('eden-legacy-sync');
      this.logger.log('Eden Legacy sync job stopped and removed');
    } catch (error) {
      this.logger.warn('No Eden Legacy sync job to stop', error.message);
    }
  }

  /**
   * Setup automated Eden Legacy synchronization
   */
  private async setupEdenLegacySync(): Promise<void> {
    try {
      const job = new CronJob(
        this.config.edenLegacyInterval,
        () => this.runEdenLegacySync(),
        null, // onComplete
        true, // start
        'UTC', // timezone
      );

      this.schedulerRegistry.addCronJob('eden-legacy-sync', job);
      
      this.logger.log('Eden Legacy sync scheduled', {
        interval: this.config.edenLegacyInterval,
        nextRun: job.nextDate()?.toISO() || '',
      });

      // Run initial sync on startup (with delay to allow system to fully initialize)
      setTimeout(() => {
        this.logger.log('Running initial Eden Legacy sync on startup');
        this.runEdenLegacySync();
      }, 10000); // 10 second delay

    } catch (error) {
      this.logger.error('Failed to setup Eden Legacy sync scheduler', error);
      throw error;
    }
  }

  /**
   * Run Eden Legacy synchronization with error handling
   */
  private async runEdenLegacySync(): Promise<void> {
    const startTime = Date.now();
    this.logger.log('Starting scheduled Eden Legacy synchronization');

    try {
      const result = await this.edenSyncService.syncEdenAgents();
      const duration = Date.now() - startTime;

      this.logger.log('Scheduled Eden Legacy sync completed', {
        ...result,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });

      // Log warning if sync had errors
      if (result.failed > 0 || result.errors.length > 0) {
        this.logger.warn('Eden Legacy sync completed with errors', {
          failed: result.failed,
          errors: result.errors,
        });
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Scheduled Eden Legacy sync failed', {
        error: error.message,
        stack: error.stack,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Manually trigger Eden Legacy sync (for testing/admin purposes)
   */
  async triggerEdenLegacySync(): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
    try {
      this.logger.log('Manual Eden Legacy sync trigger requested');
      const result = await this.edenSyncService.syncEdenAgents();
      
      return {
        success: true,
        message: 'Manual Eden Legacy sync completed',
        data: result,
      };
    } catch (error) {
      this.logger.error('Manual Eden Legacy sync failed', error);
      return {
        success: false,
        message: 'Manual Eden Legacy sync failed',
        error: error.message,
      };
    }
  }

  /**
   * Get sync scheduler status
   */
  getSchedulerStatus(): {
    enabled: boolean;
    edenLegacyInterval: string;
    nextEdenLegacyRun?: string;
    jobs: string[];
  } {
    const jobs: string[] = [];
    let nextEdenLegacyRun: string | undefined;

    if (this.config.enabled) {
      try {
        const job = this.schedulerRegistry.getCronJob('eden-legacy-sync');
        if (job) {
          jobs.push('eden-legacy-sync');
          nextEdenLegacyRun = job.nextDate()?.toISO() || undefined;
        }
      } catch (error) {
        this.logger.debug('Eden Legacy sync job not found', error.message);
      }
    }

    return {
      enabled: this.config.enabled,
      edenLegacyInterval: this.config.edenLegacyInterval,
      nextEdenLegacyRun,
      jobs,
    };
  }

  /**
   * Update sync configuration (for runtime configuration changes)
   */
  async updateScheduleConfig(newConfig: Partial<SyncScheduleConfig>): Promise<void> {
    this.logger.log('Updating sync schedule configuration', newConfig);

    // Update configuration
    Object.assign(this.config, newConfig);

    // If enabling/disabling, restart scheduler
    if (newConfig.enabled !== undefined) {
      await this.onModuleDestroy();
      await this.onModuleInit();
    }
    
    // If changing interval, restart Eden Legacy sync
    else if (newConfig.edenLegacyInterval) {
      try {
        const existingJob = this.schedulerRegistry.getCronJob('eden-legacy-sync');
        existingJob.stop();
        this.schedulerRegistry.deleteCronJob('eden-legacy-sync');
        
        await this.setupEdenLegacySync();
        this.logger.log('Eden Legacy sync rescheduled with new interval');
      } catch (error) {
        this.logger.warn('No existing Eden Legacy job to reschedule', error.message);
        await this.setupEdenLegacySync();
      }
    }

    this.logger.log('Sync schedule configuration updated successfully');
  }
}