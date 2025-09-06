import { Module } from '@nestjs/common';
import { RegistryService } from './registry.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [RegistryService],
  exports: [RegistryService],
})
export class RegistryModule {}