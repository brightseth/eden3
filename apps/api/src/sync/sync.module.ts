import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EdenSyncService } from './eden-sync.service';
import { SyncSchedulerService } from './sync-scheduler.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(), // Enable scheduling support
  ],
  providers: [EdenSyncService, SyncSchedulerService],
  exports: [EdenSyncService, SyncSchedulerService]
})
export class SyncModule {}