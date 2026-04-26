import { Reflector } from '@nestjs/core';
import { ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';
import { AuthThrottlerGuard } from 'src/auth/guards/auth-throttler.guard';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@nestjs/throttler', () => ({
  ThrottlerGuard: class MockThrottlerGuard {},
}));

describe('AuthThrottlerGuard', () => {
  let guard: AuthThrottlerGuard;
  const mockOptions: ThrottlerModuleOptions = {} as ThrottlerModuleOptions;
  const mockStorage: ThrottlerStorage = {} as ThrottlerStorage;
  const mockReflector: Reflector = {} as Reflector;

  const makeContext = (path: string, ip = '127.0.0.1') =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          route: { path },
          ip,
          connection: {
            remoteAddress: ip,
          },
        }),
      }),

      getClass: () => ({
        name: 'AuthController',
      }),

      getHandler: () => ({
        name: 'login',
      }),
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new AuthThrottlerGuard(mockOptions, mockStorage, mockReflector);
  });

  describe('shouldSkip', () => {
    it('should NOT skip throttling for /auth/login', async () => {
      const context = makeContext('/auth/login');

      const result = await (guard as any).shouldSkip(context);

      expect(result).toBe(false);
    });

    it('should NOT skip throttling for /auth/signup', async () => {
      const context = makeContext('/auth/signup');

      const result = await (guard as any).shouldSkip(context);

      expect(result).toBe(false);
    });

    it('should skip throttling for non-auth route', async () => {
      const context = makeContext('/articles');

      const result = await (guard as any).shouldSkip(context);

      expect(result).toBe(true);
    });

    it('should skip throttling if route path missing', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            route: undefined,
          }),
        }),
      } as any;

      const result = await (guard as any).shouldSkip(context);

      expect(result).toBe(true);
    });
  });

  describe('generateKey', () => {
    it('should generate key from ip, class, handler and suffix', () => {
      const context = makeContext('/auth/login', '192.168.1.5');

      const result = (guard as any).generateKey(context, 'throttle');

      expect(result).toBe('192.168.1.5:AuthController:login:throttle');
    });

    it('should use connection.remoteAddress when ip missing', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            ip: undefined,
            connection: {
              remoteAddress: '10.0.0.1',
            },
          }),
        }),

        getClass: () => ({
          name: 'AuthController',
        }),

        getHandler: () => ({
          name: 'signup',
        }),
      } as any;

      const result = (guard as any).generateKey(context, 'rate-limit');

      expect(result).toBe('10.0.0.1:AuthController:signup:rate-limit');
    });

    it('should generate different keys for different suffixes', () => {
      const context = makeContext('/auth/login');

      const key1 = (guard as any).generateKey(context, 'short');

      const key2 = (guard as any).generateKey(context, 'long');

      expect(key1).not.toEqual(key2);
    });
  });
});
