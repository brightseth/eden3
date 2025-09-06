import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AgentActivitiesService } from './agent-activities.service';
import { WebhookModule } from '../webhook/webhook.module';
import { DatabaseModule } from '../database/database.module';
import { SchedulerController } from './scheduler.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Enable scheduling
    WebhookModule,
    DatabaseModule,
  ],
  providers: [AgentActivitiesService],
  controllers: [SchedulerController],
  exports: [AgentActivitiesService],
})
export class SchedulerModule {}