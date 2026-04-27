import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from '../logger/logger.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, query, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    const rawBody = req.body ? { ...req.body } : {};

    const sanitizedBody = this.sanitizeBody(rawBody);
    const sanitizedQuery = this.sanitizeBody(query ? { ...query } : {});

    this.logger.log(
      `[REQUEST] ${method} ${originalUrl.split('?')[0]} | Query: ${JSON.stringify(sanitizedQuery)} | Body: ${JSON.stringify(sanitizedBody)} | IP: ${ip} | UA: ${userAgent}`,
      'HTTP',
    );

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      this.logger.log(
        `[RESPONSE] ${method} ${originalUrl} | Status: ${statusCode} | ${duration}ms`,
        'HTTP',
      );
    });

    next();
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sanitized = Array.isArray(body) ? [...body] : { ...body };

    const sensitiveFields = [
      'password',
      'refreshToken',
      'accessToken',
      'token',
      'secret',
      'newPassword',
      'oldPassword',
      'key',
      'apikey',
    ];

    for (const key in sanitized) {
      if (sensitiveFields.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (
        typeof sanitized[key] === 'object' &&
        sanitized[key] !== null
      ) {
        sanitized[key] = this.sanitizeBody(sanitized[key]);
      }
    }

    return sanitized;
  }
}
