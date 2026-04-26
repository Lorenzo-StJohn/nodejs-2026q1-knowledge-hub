import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Role } from '@prisma/client';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const createMockContext = (userRole?: Role): ExecutionContext => {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({
          user: userRole ? { role: userRole } : undefined,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: vi.fn(),
    } as unknown as Reflector;

    guard = new RolesGuard(reflector);
  });

  it('should return true if no roles are required (missing @Roles() metadata)', () => {
    const ctx = createMockContext();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result = guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
  });

  it('should grant access when requiredRoles is an empty array', () => {
    const ctx = createMockContext();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

    const result = guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  it('should allow access if user has the correct role', () => {
    const ctx = createMockContext(Role.admin);
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.admin]);

    const result = guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user has insufficient role', () => {
    const ctx = createMockContext(Role.viewer);

    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.admin]);

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user or role is missing', () => {
    const ctx = createMockContext(undefined);
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.admin]);

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
