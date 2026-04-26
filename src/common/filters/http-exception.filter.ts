import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from '../logger/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let error: string;
    let message: string | object;

    if (
      'statusCode' in exception &&
      typeof (exception as any).statusCode === 'number'
    ) {
      status = (exception as any).statusCode;
      error = this.statusCodeToErrorString(status);
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      error = this.statusCodeToErrorString(status);
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exceptionResponse;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'Internal Server Error';
      message = 'An unexpected error occurred';
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception.stack,
      'ExceptionFilter',
    );

    response.status(status).json({
      statusCode: status,
      error,
      message,
    });
  }

  private statusCodeToErrorString(code: number): string {
    const map: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
    };
    return map[code] || 'Internal Server Error';
  }
}
