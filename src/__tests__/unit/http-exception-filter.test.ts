import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ArgumentsHost,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { ThrottlerException } from '@nestjs/throttler';
import { AppLogger } from 'src/common/logger/logger.service';
import { NotFoundError } from 'src/common/exceptions/custom-errors';

vi.mock('winston', () => ({}));
vi.mock('winston-daily-rotate-file', () => ({}));
vi.mock('src/common/logger/size-rotating-file.transport', () => ({}));

vi.mock('../logger/logger.service', () => ({
  AppLogger: vi.fn().mockImplementation(() => ({
    error: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
  })),
}));

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;
  let mockLogger: jest.Mocked<AppLogger>;

  beforeEach(() => {
    mockLogger = {
      error: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      verbose: vi.fn(),
    } as any;

    filter = new HttpExceptionFilter(mockLogger);

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockRequest = {
      method: 'GET',
      url: '/test/url',
    };

    mockArgumentsHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
        getNext: vi.fn(),
      }),
      getArgByIndex: vi.fn(),
      getArgs: vi.fn(),
      getType: vi.fn(),
      switchToRpc: vi.fn(),
      switchToWs: vi.fn(),
    } as unknown as ArgumentsHost;
  });

  it('should format BadRequestException correctly', () => {
    const exception = new BadRequestException('Validation failed');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
    });
  });

  it('should format UnauthorizedException correctly', () => {
    const exception = new UnauthorizedException('Invalid token');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid token',
    });
  });

  it('should format ForbiddenException correctly', () => {
    const exception = new ForbiddenException('Access denied');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Access denied',
    });
  });

  it('should format NotFoundException correctly', () => {
    const exception = new NotFoundException('User not found');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 404,
      error: 'Not Found',
      message: 'User not found',
    });
  });

  it('should format HttpException with 422 Unprocessable Entity correctly', () => {
    const exception = new UnprocessableEntityException('Validation failed');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: 'Validation failed',
    });
  });

  it('should format HttpException with 429 Too Many Requests correctly', () => {
    const exception = new ThrottlerException('Too many requests');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(429);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Too many requests',
    });
  });

  it('should handle non-HttpException (unknown error) as 500', () => {
    const error = new Error('Some unexpected error');
    error.stack = 'test-stack';
    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  });

  it('should handle HttpException with an object response (e.g. from ValidationPipe)', () => {
    const complexMessage = ['email must be an email', 'password too short'];
    const exception = new BadRequestException({
      message: complexMessage,
      error: 'Bad Request',
    });

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      error: 'Bad Request',
      message: complexMessage,
    });
  });

  it('should handle HttpException with a response object that has no message property', () => {
    const customObj = { customError: 'Something went wrong' };
    const exception = new BadRequestException(customObj);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      error: 'Bad Request',
      message: customObj,
    });
  });

  it('should log error when handling non-HttpException', () => {
    const error = new Error('Database connection failed');
    error.stack = 'test-stack-trace';
    filter.catch(error, mockArgumentsHost);

    expect(mockLogger.error).toHaveBeenCalledWith(
      'GET /test/url - 500 - An unexpected error occurred',
      'test-stack-trace',
      'ExceptionFilter',
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });

  it('should handle custom error with statusCode (e.g. NotFoundError)', () => {
    const exception = new NotFoundError('Resource not found');
    exception.stack = 'custom-error-stack';

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 404,
      error: 'Not Found',
      message: 'Resource not found',
    });
    expect(mockLogger.error).toHaveBeenCalledWith(
      'GET /test/url - 404 - Resource not found',
      'custom-error-stack',
      'ExceptionFilter',
    );
  });
});
