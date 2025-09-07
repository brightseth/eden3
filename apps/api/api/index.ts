import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as compression from 'compression';
import helmet from 'helmet';
const express = require('express');
import { AppServerlessModule } from '../src/app.serverless.module';

// Global app instance for serverless
let app: any = null;

// Create the NestJS application instance
async function createApp() {
  if (app) return app;

  const server = express();
  const nestApp = await NestFactory.create(AppServerlessModule, new ExpressAdapter(server));
  
  const logger = new Logger('Vercel');

  // Trust proxy for Vercel
  server.set('trust proxy', 1);

  // Dead-simple probes first - NO dependencies, NO middleware
  server.get('/health', (_req, res) => res.status(200).json({ ok: true, platform: 'vercel' }));
  server.get('/', (_req, res) => res.status(200).json({ message: 'EDEN3 API on Vercel', status: 'ok' }));
  
  // Debug route for Vercel headers
  server.get('/_debug/headers', (req, res) => {
    res.status(200).json({
      xfp: req.headers['x-forwarded-proto'],
      xfh: req.headers['x-forwarded-host'],
      host: req.headers['host'],
      platform: 'vercel',
      timestamp: new Date().toISOString(),
    });
  });

  // Security headers (Vercel-safe)
  nestApp.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
  }));

  // Compression
  nestApp.use(compression());

  // Global validation pipe
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    })
  );

  // CORS Configuration
  const corsOptions = {
    origin: (origin: string | undefined, callback: (error: Error | null, success?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      if (process.env.NODE_ENV === 'production') {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [
          'https://eden3.vercel.app',
          'https://academy.eden3.ai',
          'https://api.eden3.ai'
        ];
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked request from origin: ${origin}`);
          callback(new Error('Not allowed by CORS'), false);
        }
      } else {
        // Allow all origins in development
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Eden-Signature', 
      'X-Eden-Event-Id', 
      'X-Eden-Event-Type',
      'X-Request-ID',
      'Accept',
      'Origin',
      'User-Agent'
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset'
    ],
    credentials: true,
    maxAge: 86400, // Cache preflight for 24 hours
    optionsSuccessStatus: 200, // For legacy browser support
  };
  
  nestApp.enableCors(corsOptions);

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('EDEN3 API')
    .setDescription(`
      ## Next Generation AI Agents Platform API (Serverless)
      
      Complete API for managing AI agents, processing webhooks, and handling events.
      Deployed on Vercel as a serverless function.
      
      ### Features
      - 🤖 **Agent Management**: Complete CRUD operations with KPI tracking
      - 🔒 **Webhook Processing**: HMAC-verified event ingestion
      - ⚡ **Serverless**: Vercel-optimized deployment
      - 🚦 **Rate Limiting**: Multiple-tier protection
      - 📊 **Real-time Analytics**: Live KPIs and performance metrics
      - 🎨 **Works Tracking**: Creative output with sales and revenue
      - 🛡️ **Security**: Helmet headers, CORS, input validation
      
      ### Authentication
      API endpoints support multiple authentication methods:
      - **HMAC Signatures** (webhooks): X-Eden-Signature header
      - **Bearer Tokens** (admin operations): Authorization header
    `)
    .setVersion('0.1.0')
    .addTag('agents', 'AI agent management and analytics')
    .addTag('webhooks', 'Event processing and webhook endpoints')
    .addTag('health', 'System health and monitoring')
    .addServer('/', 'Vercel Serverless')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(nestApp, config);
  SwaggerModule.setup('docs', nestApp, document);

  // Global prefix for API routes (health routes already defined above)
  nestApp.setGlobalPrefix('api/v1', {
    exclude: ['/health', '/docs', '/', '/_debug/headers'],
  });

  await nestApp.init();
  
  app = server;
  
  logger.log('🚀 EDEN3 API initialized for Vercel');
  logger.log('📚 Swagger docs: /docs');
  logger.log('🏥 Health check: /health');
  logger.log('🌐 Environment: production (serverless)');
  
  return app;
}

// Vercel serverless function export
export default async function handler(req: any, res: any) {
  try {
    const app = await createApp();
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      platform: 'vercel'
    });
  }
}