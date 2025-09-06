import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class HmacService {
  private readonly logger = new Logger(HmacService.name);
  private readonly secret: string;

  constructor(private configService: ConfigService) {
    this.secret = this.configService.get<string>('WEBHOOK_SECRET') || 'dev-secret-key';
    if (this.secret === 'dev-secret-key') {
      this.logger.warn('Using default webhook secret. Set WEBHOOK_SECRET environment variable for production.');
    }
  }

  /**
   * Generate HMAC signature for payload
   */
  generateSignature(payload: Buffer): string {
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Verify HMAC signature
   */
  verifySignature(payload: Buffer, signature: string): boolean {
    const expectedSignature = this.generateSignature(payload);
    
    // Use crypto.timingSafeEqual to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const actualBuffer = Buffer.from(signature, 'utf8');
    
    // Ensure buffers are same length to prevent timing attacks
    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    const isValid = crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    
    if (!isValid) {
      this.logger.warn('HMAC signature verification failed', {
        expectedLength: expectedSignature.length,
        actualLength: signature.length,
        expected: expectedSignature.substring(0, 16) + '...',
        actual: signature.substring(0, 16) + '...',
      });
    }

    return isValid;
  }

  /**
   * Generate signature for testing
   */
  signPayload(payload: any): string {
    const buffer = Buffer.from(JSON.stringify(payload), 'utf8');
    return this.generateSignature(buffer);
  }
}