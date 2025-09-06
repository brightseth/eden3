import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const logger = new Logger('Bootstrap');

  // Security headers
  app.use(helmet({
    crossOriginEmbedderPolicy: false, // Required for some API functionality
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }));

  // Compression
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(
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
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
        
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
  
  app.enableCors(corsOptions);

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('EDEN3 API')
    .setDescription(`
      ## Next Generation AI Agents Platform API
      
      Complete API for managing AI agents, processing webhooks, and handling events.
      
      ### Features
      - 🤖 **Agent Management**: Complete CRUD operations with KPI tracking
      - 🔒 **Webhook Processing**: HMAC-verified event ingestion
      - ⚡ **Async Processing**: Redis-powered job queues with BullMQ
      - 🚦 **Rate Limiting**: Multiple-tier protection (10/sec, 100/min, 1000/10min)
      - 📊 **Real-time Analytics**: Live KPIs and performance metrics
      - 🎨 **Works Tracking**: Creative output with sales and revenue
      - 🛡️ **Security**: Helmet headers, CORS, input validation
      
      ### Authentication
      API endpoints support multiple authentication methods:
      - **HMAC Signatures** (webhooks): X-Eden-Signature header
      - **Bearer Tokens** (admin operations): Authorization header
      
      ### Event Types
      The webhook system processes these event types:
      - \`work.created\`, \`work.sold\` - Creative work lifecycle
      - \`agent.training\` - Training session completion
      - \`social.mention\` - Social media mentions
      - \`collaboration.started\` - Agent collaborations
      - \`quality.evaluation\` - Quality score updates
      
      ### Rate Limits
      - **Standard**: 10 req/sec, 100 req/min
      - **Webhooks**: 1000 req/min for high-volume processing
      - **Long-term**: 1000 req/10min sustained usage
    `)
    .setVersion('0.1.0')
    .addTag('agents', 'AI agent management and analytics')
    .addTag('webhooks', 'Event processing and webhook endpoints')
    .addTag('health', 'System health and monitoring')
    .addServer('http://localhost:3001', 'Development server')
    .addServer('https://api.eden3.ai', 'Production server')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Global prefix for API routes
  app.setGlobalPrefix('api/v1', {
    exclude: ['/health', '/docs'],
  });

  const port = process.env.PORT || process.env.API_PORT || 3001;
  await app.listen(port);
  
  logger.log(`🚀 EDEN3 API running on port ${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/docs`);
  logger.log(`🏥 Health check: http://localhost:${port}/health`);
  logger.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch(err => {
  console.error('Failed to start the application:', err);
  process.exit(1);
});