import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
import { Configuration } from 'src/config/configuration';
import { SizeRotatingFileTransport } from './size-rotating-file.transport';

const customLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  verbose: 5,
};

@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger;

  constructor(private readonly config: Configuration) {
    const isProduction = this.config.isProduction;
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
          format: isProduction
            ? winston.format.json()
            : winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
              ),
        }),
        new SizeRotatingFileTransport({
          filename: path.join(logDir, 'app.log'),
          maxSize: maxFileSize,
          format: winston.format.json(),
        }) as any,
      ],
    });
  }

  private mapLogLevel(level: string): string {
    const map: Record<string, string> = {
      fatal: 'fatal',
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

  fatal(message: string, trace?: string, context?: string) {
    this.logger.log('fatal', message, { trace, context });
  }
}
