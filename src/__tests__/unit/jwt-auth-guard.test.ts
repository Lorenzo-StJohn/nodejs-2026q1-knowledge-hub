import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { IS_PUBLIC_KEY } from 'src/auth/decorators/public.decorator';

const mockSuperCanActivate = vi.fn();

vi.mock('@nestjs/passport', () => ({
  AuthGuard: vi.fn(() => {
    return class {
      canActivate(...args: any[]) {
        return mockSuperCanActivate(...args);
      }
    };
  }),
}));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  const mockExecutionContext = (): ExecutionContext =>
    ({
      getHandler: vi.fn(),
      getClass: vi.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: { getAllAndOverride: vi.fn() },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    it('should allow access if route is public', async () => {
      const ctx = mockExecutionContext();
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]);
      expect(mockSuperCanActivate).not.toHaveBeenCalled();
    });

    it('should return true if token is valid (delegates to passport)', async () => {
      const ctx = mockExecutionContext();
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      mockSuperCanActivate.mockResolvedValue(true);

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(mockSuperCanActivate).toHaveBeenCalledWith(ctx);
    });

    it('should throw UnauthorizedException if passport fails due to missing/malformed/expired token', async () => {
      const ctx = mockExecutionContext();
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      mockSuperCanActivate.mockRejectedValue(new UnauthorizedException());

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockSuperCanActivate).toHaveBeenCalledWith(ctx);
    });
  });
});
