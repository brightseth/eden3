import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { DatabaseModule } from './database/database.module';
import { AgentsModule } from './agents/agents.module';
import { RegistryModule } from './registry/registry.module';
import { HealthModule } from './health/health.module';
import { WebhookModule } from './webhook/webhook.module';
import { SecurityModule } from './security/security.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { RawBodyMiddleware } from './middleware/raw-body.middleware';
import { getRateLimitingConfig } from './config/rate-limiting.config';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Redis/BullMQ configuration
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot(getRateLimitingConfig()),

    // Core modules
    SecurityModule,
    DatabaseModule,
    RegistryModule,
    
    // Feature modules
    AgentsModule,
    WebhookModule,
    // SchedulerModule, // Temporarily disabled for deployment
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes('/api/v1/webhook');
  }
}