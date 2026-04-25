import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  verbose: 4,
};

@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const logLevel = process.env.LOG_LEVEL || 'log';
    const maxFileSize =
      parseInt(process.env.LOG_MAX_FILE_SIZE || '1024', 10) * 1024;

    const logDir = path.join(process.cwd(), 'logs');

    this.logger = winston.createLogger({
      levels: customLevels,
      level: this.mapLogLevel(logLevel),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),

        new winston.transports.DailyRotateFile({
          filename: path.join(logDir, 'app-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: maxFileSize,
          maxFiles: '14d',
          format: winston.format.json(),
        }),
      ],
    });
  }

  private mapLogLevel(level: string): string {
    const map: Record<string, string> = {
      log: 'info',
      debug: 'debug',
      warn: 'warn',
      error: 'error',
      verbose: 'verbose',
    };
    return map[level] || 'info';
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
