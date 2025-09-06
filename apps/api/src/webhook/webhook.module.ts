import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WebhookController } from './webhook.controller';
import { WebhookStatsController } from './webhook-stats.controller';
import { WebhookService } from './webhook.service';
import { EventProcessor } from './processors/event.processor';
import { DatabaseModule } from '../database/database.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [
    DatabaseModule,
    SecurityModule,
    BullModule.registerQueue({
      name: 'events',
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
  ],
  controllers: [WebhookController, WebhookStatsController],
  providers: [WebhookService, EventProcessor],
  exports: [WebhookService],
})
export class WebhookModule {}