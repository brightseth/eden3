import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3001);
  const host = '0.0.0.0';

  const app = await NestFactory.create(AppModule); // HTTP only in prod

  const logger = new Logger('Bootstrap');

  // Trust Railway's proxy for proper x-forwarded-* header handling
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Dead-simple probes first - NO dependencies, NO middleware
  app.getHttpAdapter().get('/health', (_req, res) => res.status(200).json({ ok: true }));
  app.getHttpAdapter().get('/', (_req, res) => res.status(200).send('ok'));
  
  // Debug route to validate Railway proxy headers
  app.getHttpAdapter().get('/_debug/headers', (req, res) => {
    res.status(200).json({
      xfp: req.headers['x-forwarded-proto'],
      xfh: req.headers['x-forwarded-host'],
      host: req.headers['host'],
      timestamp: new Date().toISOString(), // Railway edge fix trigger
    });
  });

  // Skip redirects on health and debug endpoints
  app.use((req, res, next) => {
    if (req.path === '/' || req.path === '/health' || req.path === '/_debug/headers') return next();
    const proto = req.headers['x-forwarded-proto'];
    if (process.env.FORCE_HTTPS === '1' && proto && proto !== 'https') {
      return res.redirect(308, `https://${req.headers.host}${req.url}`);
    }
    next();
  });

  // Security headers (Railway-safe)
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        // Remove upgradeInsecureRequests - Railway handles TLS termination
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

  // Global prefix for API routes (health routes already defined above)
  app.setGlobalPrefix('api/v1', {
    exclude: ['/health', '/docs', '/'],
  });

  await app.listen(port, host);
  
  console.log(`[api] listening on http://${host}:${port} (PORT=${process.env.PORT})`);
  logger.log(`🚀 EDEN3 API running on http://${host}:${port}`);
  logger.log(`📚 Swagger docs: http://${host}:${port}/docs`);
  logger.log(`🏥 Health check: http://${host}:${port}/health`);
  logger.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch(err => {
  console.error('Failed to start the application:', err);
  process.exit(1);
});