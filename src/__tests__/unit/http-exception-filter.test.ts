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

vi.mock('@nestjs/common', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@nestjs/common')>();
  return {
    ...actual,
    Logger: vi.fn(function (this: any) {
      this.error = vi.fn();
      this.log = vi.fn();
      this.warn = vi.fn();
      this.debug = vi.fn();
      this.verbose = vi.fn();
    }),
  };
});

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockRequest = {
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
      message: 'Validation failed',
      timestamp: expect.any(String),
      path: '/test/url',
    });
  });

  it('should format UnauthorizedException correctly', () => {
    const exception = new UnauthorizedException('Invalid token');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Invalid token',
      }),
    );
  });

  it('should format ForbiddenException correctly', () => {
    const exception = new ForbiddenException('Access denied');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: 'Access denied',
      }),
    );
  });

  it('should format NotFoundException correctly', () => {
    const exception = new NotFoundException('User not found');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'User not found',
      }),
    );
  });

  it('should format HttpException with 422 Unprocessable Entity correctly', () => {
    const exception = new UnprocessableEntityException('Validation failed');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 422,
        message: 'Validation failed',
      }),
    );
  });

  it('should format HttpException with 429 Too Many Requests correctly', () => {
    const exception = new ThrottlerException('Too many requests');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(429);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 429,
        message: 'Too many requests',
      }),
    );
  });

  it('should handle non-HttpException (unknown error) as 500', () => {
    const error = new Error('Some unexpected error');
    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });

  it('should include timestamp and path in every response', () => {
    const exception = new BadRequestException('test');
    filter.catch(exception, mockArgumentsHost);

    const responseBody = mockResponse.json.mock.calls[0][0];
    expect(responseBody).toHaveProperty('timestamp');
    expect(responseBody).toHaveProperty('path', '/test/url');
    expect(new Date(responseBody.timestamp).getTime()).not.toBeNaN();
  });

  it('should handle HttpException with an object response (e.g. from ValidationPipe)', () => {
    const complexMessage = ['email must be an email', 'password too short'];
    const exception = new BadRequestException({
      message: complexMessage,
      error: 'Bad Request',
    });

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: complexMessage,
      }),
    );
  });

  it('should handle HttpException with a response object that has no message property', () => {
    const customObj = { customError: 'Something went wrong' };
    const exception = new BadRequestException(customObj);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: customObj,
      }),
    );
  });

  it('should log error when handling non-HttpException', () => {
    const error = new Error('Database connection failed');
    error.stack = 'test-stack-trace';
    const loggerSpy = vi.spyOn((filter as any).logger, 'error');

    filter.catch(error, mockArgumentsHost);

    expect(loggerSpy).toHaveBeenCalledWith(
      'Unhandled exception: Error: Database connection failed',
      'test-stack-trace',
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });
});
