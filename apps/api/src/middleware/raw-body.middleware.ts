import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RawBodyMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Only capture raw body for webhook endpoints
    if (req.path.startsWith('/api/v1/webhook')) {
      const chunks: Buffer[] = [];
      
      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      req.on('end', () => {
        const rawBody = Buffer.concat(chunks);
        (req as any).rawBody = rawBody;
        
        this.logger.debug('Raw body captured for webhook', {
          path: req.path,
          method: req.method,
          bodyLength: rawBody.length,
          contentType: req.headers['content-type'],
        });
        
        next();
      });
    } else {
      next();
    }
  }
}