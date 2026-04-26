import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { ConditionalPaginationInterceptor } from 'src/common/interceptors/conditional-pagination.interceptor';
import { describe, it, expect, vi } from 'vitest';

describe('ConditionalPaginationInterceptor', () => {
  let interceptor: ConditionalPaginationInterceptor<any>;

  beforeEach(() => {
    interceptor = new ConditionalPaginationInterceptor();
  });

  const mockExecutionContext = (query: Record<string, any>) =>
    ({
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({ query }),
      }),
    }) as unknown as ExecutionContext;

  const mockCallHandler = (response: any) =>
    ({
      handle: vi.fn().mockReturnValue(of(response)),
    }) as unknown as CallHandler;

  it('should unwrap response.data when no page/limit query and data is an array', async () => {
    const ctx = mockExecutionContext({});
    const list = [{ id: 1 }, { id: 2 }];
    const response = { data: list, total: 100 };
    const handler = mockCallHandler(response);

    const result$ = interceptor.intercept(ctx, handler);
    const result = await lastValueFrom(result$);

    expect(result).toEqual(list);
  });

  it('should keep full response when no page/limit but data is NOT an array', async () => {
    const ctx = mockExecutionContext({});
    const response = { data: 'string', other: true };
    const handler = mockCallHandler(response);

    const result = await lastValueFrom(interceptor.intercept(ctx, handler));

    expect(result).toEqual(response);
  });

  it('should keep full response when no page/limit and response.data is absent', async () => {
    const ctx = mockExecutionContext({});
    const response = { total: 100 };
    const handler = mockCallHandler(response);

    const result = await lastValueFrom(interceptor.intercept(ctx, handler));

    expect(result).toEqual(response);
  });

  it('should keep full response when page query is present', async () => {
    const ctx = mockExecutionContext({ page: '1' });
    const list = [{ id: 1 }];
    const response = { data: list, page: 1 };
    const handler = mockCallHandler(response);

    const result = await lastValueFrom(interceptor.intercept(ctx, handler));

    expect(result).toEqual(response);
  });

  it('should keep full response when limit query is present', async () => {
    const ctx = mockExecutionContext({ limit: '10' });
    const list = [{ id: 1 }];
    const response = { data: list, limit: 10 };
    const handler = mockCallHandler(response);

    const result = await lastValueFrom(interceptor.intercept(ctx, handler));

    expect(result).toEqual(response);
  });

  it('should keep full response when both page and limit are present', async () => {
    const ctx = mockExecutionContext({ page: '2', limit: '5' });
    const response = { data: [{ id: 1 }], page: 2, limit: 5 };
    const handler = mockCallHandler(response);

    const result = await lastValueFrom(interceptor.intercept(ctx, handler));

    expect(result).toEqual(response);
  });

  it('should unwrap empty data array to empty array when no page/limit', async () => {
    const ctx = mockExecutionContext({});
    const response = { data: [], other: 'info' };
    const handler = mockCallHandler(response);

    const result = await lastValueFrom(interceptor.intercept(ctx, handler));

    expect(result).toEqual([]);
  });

  it('should handle null response gracefully (return null unchanged)', async () => {
    const ctx = mockExecutionContext({});
    const response = null;
    const handler = mockCallHandler(response);

    const result = await lastValueFrom(interceptor.intercept(ctx, handler));

    expect(result).toBeNull();
  });

  it('should handle undefined response (return undefined unchanged)', async () => {
    const ctx = mockExecutionContext({});
    const response = undefined;
    const handler = mockCallHandler(response);

    const result = await lastValueFrom(interceptor.intercept(ctx, handler));

    expect(result).toBeUndefined();
  });
});
