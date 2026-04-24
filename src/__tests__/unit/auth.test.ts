import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/domain/repositories/user.repository.interface';
import {
  TOKEN_REPOSITORY,
  TokenRepository,
} from 'src/domain/repositories/token.repository.interface';
import { User } from 'src/domain/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';

vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue(''),
  compare: vi.fn().mockResolvedValue(true),
}));

vi.mock('class-transformer', async (importOriginal) => {
  const actual = await importOriginal<typeof import('class-transformer')>();
  return {
    ...actual,
    plainToInstance: vi.fn(),
  };
});

import { LoginDto } from 'src/auth/dto/login.dto';
import { Role } from '@prisma/client';

const originalEnv = process.env;

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepo: Record<keyof UserRepository, any>;
  let mockTokenRepo: Record<keyof TokenRepository, any>;
  let mockJwtService: Record<string, any>;

  beforeEach(async () => {
    vi.clearAllMocks();

    process.env = {
      ...originalEnv,
      CRYPT_SALT: '10',
      JWT_SECRET: 'test-access-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_ACCESS_TTL: '15m',
      JWT_REFRESH_TTL: '7',
    };

    mockUserRepo = {
      findByLogin: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    } as any;

    mockTokenRepo = {
      findByToken: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    } as any;

    mockJwtService = {
      signAsync: vi.fn(),
      verify: vi.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepo,
        },
        {
          provide: TOKEN_REPOSITORY,
          useValue: mockTokenRepo,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      login: 'testuser',
      password: 'plainPassword',
    };
    const hashedPassword = 'hashedpassword';

    const mockUser = new User({
      login: loginDto.login,
      password: hashedPassword,
    });

    it('should generate tokens and save refresh token on successful login', async () => {
      const accessToken = 'access123';
      const refreshToken = 'refresh456';
      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);
      mockUserRepo.findByLogin.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result).toEqual({ accessToken, refreshToken });

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);

      const expectedPayload = {
        userId: mockUser.id,
        login: mockUser.login,
        role: mockUser.role,
      };

      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        expectedPayload,
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_ACCESS_TTL,
        },
      );

      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        expectedPayload,
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.JWT_REFRESH_TTL,
        },
      );

      expect(mockTokenRepo.create).toHaveBeenCalledTimes(1);
      expect(mockTokenRepo.create).toHaveBeenCalledWith(
        refreshToken,
        mockUser.id,
        expect.any(Date),
      );

      const savedExpiresAt = mockTokenRepo.create.mock.calls[0][2];
      const expectedExpiry = new Date();
      expectedExpiry.setDate(expectedExpiry.getDate() + 7);
      const diffMs = Math.abs(
        savedExpiresAt.getTime() - expectedExpiry.getTime(),
      );
      expect(diffMs).toBeLessThan(1000);
    });
  });

  describe('refresh', () => {
    const oldRefreshToken = 'old-refresh-token';
    const id = 'fakeId';
    const mockPayload = {
      userId: id,
      login: 'testuser',
      role: Role.viewer,
    };
    const mockUser = new User({
      login: mockPayload.login,
      password: 'hashed',
    });

    it('should generate new tokens and delete old refresh token on valid refresh', async () => {
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const storedToken = {
        token: oldRefreshToken,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 100000),
      };
      mockTokenRepo.findByToken.mockResolvedValue(storedToken);

      const newAccessToken = 'newAccess';
      const newRefreshToken = 'newRefresh';
      mockJwtService.signAsync
        .mockResolvedValueOnce(newAccessToken)
        .mockResolvedValueOnce(newRefreshToken);

      const result = await service.refresh(oldRefreshToken);

      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      expect(mockTokenRepo.delete).toHaveBeenCalledWith(oldRefreshToken);

      const expectedPayload = {
        userId: mockUser.id,
        login: mockUser.login,
        role: mockUser.role,
      };
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        expectedPayload,
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_ACCESS_TTL,
        },
      );
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        expectedPayload,
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.JWT_REFRESH_TTL,
        },
      );

      expect(mockTokenRepo.create).toHaveBeenCalledWith(
        newRefreshToken,
        mockUser.id,
        expect.any(Date),
      );
    });
  });
});
