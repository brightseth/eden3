import { ThrottlerModuleOptions } from '@nestjs/throttler';

export interface RateLimitingConfig {
  development: ThrottlerModuleOptions;
  production: ThrottlerModuleOptions;
}

export const rateLimitingConfig: RateLimitingConfig = {
  development: [
    {
      name: 'short',
      ttl: 1000, // 1 second
      limit: 20, // More lenient for development
    },
    {
      name: 'medium',
      ttl: 60000, // 1 minute
      limit: 200, // More lenient for development
    },
    {
      name: 'long',
      ttl: 600000, // 10 minutes
      limit: 2000, // More lenient for development
    },
    {
      name: 'webhook',
      ttl: 60000, // 1 minute
      limit: 1000,
    },
  ],
  production: [
    {
      name: 'short',
      ttl: 1000, // 1 second
      limit: 10, // Strict rate limiting
    },
    {
      name: 'medium',
      ttl: 60000, // 1 minute
      limit: 100,
    },
    {
      name: 'long',
      ttl: 600000, // 10 minutes
      limit: 1000,
    },
    {
      name: 'webhook',
      ttl: 60000, // 1 minute
      limit: 1000, // High limit for webhook processing
    },
    {
      name: 'auth',
      ttl: 900000, // 15 minutes
      limit: 5, // Very strict for authentication endpoints
    },
    {
      name: 'upload',
      ttl: 300000, // 5 minutes
      limit: 10, // Limited for file uploads
    },
  ],
};

export const getRateLimitingConfig = (): ThrottlerModuleOptions => {
  const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  return rateLimitingConfig[environment];
};

// Custom decorators for specific rate limits
export const RateLimits = {
  AUTH: { name: 'auth' },
  WEBHOOK: { name: 'webhook' },
  UPLOAD: { name: 'upload' },
  STANDARD: { name: 'medium' },
  STRICT: { name: 'short' },
} as const;