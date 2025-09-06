import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { DatabaseModule } from '../database/database.module';
import { RegistryModule } from '../registry/registry.module';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [DatabaseModule, RegistryModule, SyncModule],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}