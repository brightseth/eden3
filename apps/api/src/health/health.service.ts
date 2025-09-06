import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as os from 'os';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Basic health check
   */
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
    };
  }

  /**
   * Detailed health check with all services
   */
  async detailedCheck() {
    const timestamp = new Date().toISOString();
    
    try {
      const [databaseHealth, redisHealth, queueHealth, systemHealth] = await Promise.allSettled([
        this.checkDatabase(),
        this.checkRedis(),
        this.checkQueue(),
        this.getSystemHealth(),
      ]);

      const services = {
        database: databaseHealth.status === 'fulfilled' ? databaseHealth.value : { status: 'error', error: databaseHealth.reason },
        redis: redisHealth.status === 'fulfilled' ? redisHealth.value : { status: 'error', error: redisHealth.reason },
        queue: queueHealth.status === 'fulfilled' ? queueHealth.value : { status: 'error', error: queueHealth.reason },
      };

      const system = systemHealth.status === 'fulfilled' ? systemHealth.value : { status: 'error' };

      // Determine overall status
      const hasErrors = Object.values(services).some(service => service.status === 'error');
      const overallStatus = hasErrors ? 'degraded' : 'ok';

      return {
        status: overallStatus,
        timestamp,
        services,
        system,
        version: process.env.npm_package_version || '0.1.0',
        environment: process.env.NODE_ENV || 'development',
      };
    } catch (error) {
      this.logger.error('Health check failed', error);
      return {
        status: 'error',
        timestamp,
        error: error.message,
        version: process.env.npm_package_version || '0.1.0',
        environment: process.env.NODE_ENV || 'development',
      };
    }
  }

  /**
   * Readiness check - service ready to accept traffic
   */
  async readinessCheck() {
    try {
      // Check critical dependencies
      await this.checkDatabase();
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
        },
      };
    } catch (error) {
      this.logger.error('Readiness check failed', error);
      throw new ServiceUnavailableException('Service not ready', {
        cause: error,
        description: 'Database connection failed',
      });
    }
  }

  /**
   * Liveness check - service is alive
   */
  async livenessCheck() {
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;

    // Check for memory leaks (adjust threshold as needed)
    const memoryThreshold = 500; // MB
    if (memoryUsageMB > memoryThreshold) {
      this.logger.warn(`High memory usage: ${memoryUsageMB.toFixed(2)}MB`, {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        threshold: memoryThreshold,
      });
    }

    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(memoryUsageMB * 100) / 100,
        threshold: memoryThreshold,
      },
    };
  }

  /**
   * Check database connectivity and performance
   */
  private async checkDatabase() {
    const startTime = Date.now();
    
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      // Get connection info (if available)
      let connections = 0;
      try {
        const result = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count FROM pg_stat_activity WHERE state = 'active'
        `;
        connections = Number(result[0]?.count || 0);
      } catch {
        // Ignore if not PostgreSQL or query fails
      }

      return {
        status: 'ok',
        responseTime,
        connections,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'error',
        error: error.message,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check Redis connectivity and performance
   */
  private async checkRedis() {
    // This would check Redis if we had a Redis client injected
    // For now, return a mock response
    return {
      status: process.env.REDIS_URL ? 'ok' : 'not_configured',
      responseTime: 2,
      memory: 'N/A',
    };
  }

  /**
   * Check queue status
   */
  private async checkQueue() {
    // This would check BullMQ queue status if we had the queue injected
    // For now, return a mock response
    return {
      status: 'ok',
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
    };
  }

  /**
   * Get system health metrics
   */
  private async getSystemHealth() {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
      uptime: process.uptime(),
      memory: {
        used: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100, // MB
        total: Math.round((totalMemory / 1024 / 1024) * 100) / 100, // MB
        percentage: Math.round((usedMemory / totalMemory) * 10000) / 100, // %
      },
      cpu: {
        usage: Math.round(process.cpuUsage().user / 1000), // microseconds to milliseconds
        loadAverage: os.loadavg(),
      },
    };
  }
}