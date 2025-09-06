import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { HmacService } from '../security/hmac.service';

@Injectable()
export class HmacGuard implements CanActivate {
  private readonly logger = new Logger(HmacGuard.name);

  constructor(private readonly hmacService: HmacService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Skip HMAC verification for test endpoints in development
    if (request.path.endsWith('/test') && process.env.NODE_ENV !== 'production') {
      this.logger.log('Skipping HMAC verification for test endpoint');
      return true;
    }

    const signature = request.headers['x-eden-signature'] as string;
    
    if (!signature) {
      this.logger.warn('Missing HMAC signature header', {
        path: request.path,
        method: request.method,
        headers: Object.keys(request.headers),
      });
      throw new UnauthorizedException('Missing X-Eden-Signature header');
    }

    // Get raw body from request (must be available from middleware)
    const rawBody = (request as any).rawBody;
    
    if (!rawBody) {
      this.logger.error('Raw body not available for HMAC verification', {
        path: request.path,
        method: request.method,
      });
      throw new UnauthorizedException('Cannot verify signature without raw body');
    }

    try {
      const isValid = this.hmacService.verifySignature(rawBody, signature);
      
      if (!isValid) {
        this.logger.warn('HMAC signature verification failed', {
          path: request.path,
          method: request.method,
          signatureLength: signature.length,
          bodyLength: rawBody.length,
        });
        throw new UnauthorizedException('Invalid HMAC signature');
      }

      this.logger.log('HMAC signature verified successfully', {
        path: request.path,
        method: request.method,
        bodyLength: rawBody.length,
      });

      return true;
    } catch (error) {
      this.logger.error('HMAC verification error', {
        error: error.message,
        path: request.path,
        method: request.method,
      });
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException('HMAC verification failed');
    }
  }
}