import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from '../logger/logger.service';
import { sanitizeSensitiveData } from '../utils/sanitize.util';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, query, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    const rawBody = req.body ? { ...req.body } : {};

    const sanitizedBody = sanitizeSensitiveData(rawBody);
    const sanitizedQuery = sanitizeSensitiveData(query ? { ...query } : {});

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
}
