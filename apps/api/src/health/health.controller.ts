import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Basic health check',
    description: 'Simple health check endpoint that returns API status',
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', example: 123456 },
        version: { type: 'string', example: '0.1.0' },
      },
    },
  })
  async check() {
    return this.healthService.check();
  }

  @Get('detailed')
  @ApiOperation({ 
    summary: 'Detailed health check',
    description: 'Comprehensive health check including database, queue, and system status',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        services: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                responseTime: { type: 'number', example: 15 },
                connections: { type: 'number', example: 5 },
              },
            },
            redis: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                responseTime: { type: 'number', example: 2 },
                memory: { type: 'string', example: '2.5MB' },
              },
            },
            queue: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                waiting: { type: 'number', example: 3 },
                active: { type: 'number', example: 1 },
                completed: { type: 'number', example: 147 },
                failed: { type: 'number', example: 2 },
              },
            },
          },
        },
        system: {
          type: 'object',
          properties: {
            uptime: { type: 'number', example: 123456 },
            memory: {
              type: 'object',
              properties: {
                used: { type: 'number', example: 85.6 },
                total: { type: 'number', example: 512 },
                percentage: { type: 'number', example: 16.7 },
              },
            },
            cpu: {
              type: 'object',
              properties: {
                usage: { type: 'number', example: 12.5 },
                loadAverage: { type: 'array', items: { type: 'number' }, example: [0.5, 0.7, 0.8] },
              },
            },
          },
        },
        version: { type: 'string', example: '0.1.0' },
        environment: { type: 'string', example: 'production' },
      },
    },
  })
  async detailedCheck() {
    return this.healthService.detailedCheck();
  }

  @Get('ready')
  @ApiOperation({ 
    summary: 'Readiness probe',
    description: 'Kubernetes readiness probe - checks if the service is ready to accept traffic',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is ready',
  })
  @ApiResponse({
    status: 503,
    description: 'Service is not ready',
  })
  async ready() {
    return this.healthService.readinessCheck();
  }

  @Get('live')
  @ApiOperation({ 
    summary: 'Liveness probe',
    description: 'Kubernetes liveness probe - checks if the service is alive and should not be restarted',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
  })
  async live() {
    return this.healthService.livenessCheck();
  }
}