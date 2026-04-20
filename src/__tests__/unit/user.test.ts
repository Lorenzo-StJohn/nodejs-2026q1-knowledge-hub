import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

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
import { SignupDto } from 'src/auth/dto/signup.dto';

vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue(''),
  compare: vi.fn().mockResolvedValue(true),
}));

import { hash } from 'bcryptjs';

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

  describe('signup', () => {
    const signupDto: SignupDto = {
      login: 'testuser',
      password: 'plainPassword',
    };

    it('should throw BadRequestException if login already exists', async () => {
      const existingUser = new User({
        login: 'testuser',
        password: 'hashed',
        role: 'viewer',
      });
      mockUserRepo.findByLogin.mockResolvedValue(existingUser);

      const signupPromise = service.signup(signupDto);

      await expect(signupPromise).rejects.toThrow(BadRequestException);
      await expect(signupPromise).rejects.toThrow(
        'User with this login already exists',
      );

      expect(mockUserRepo.findByLogin).toHaveBeenCalledWith('testuser');
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });

    it('should hash password', async () => {
      mockUserRepo.findByLogin.mockResolvedValue(null);
      const hashedPassword = 'hashedPassword';
      vi.mocked(hash as Mock).mockResolvedValue(hashedPassword);

      const createdUser = new User({
        login: 'newuser',
        password: hashedPassword,
        role: Role.viewer,
      });
      mockUserRepo.create.mockResolvedValue(createdUser);

      await service.signup(signupDto);

      expect(hash).toHaveBeenCalledTimes(1);
      expect(hash).toHaveBeenCalledWith('plainPassword', 10);

      expect(mockUserRepo.create).toHaveBeenCalledTimes(1);
      const userArg = mockUserRepo.create.mock.calls[0][0];
      expect(userArg.password).toBe(hashedPassword);
    });
  });
});
