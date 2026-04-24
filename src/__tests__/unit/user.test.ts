import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { plainToInstance } from 'class-transformer';

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

import { hash } from 'bcryptjs';

import { Role } from '@prisma/client';
import { UserService } from 'src/modules/user/user.service';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { UpdatePasswordDto } from 'src/modules/user/dto/update-user.dto';
import { LoginDto } from 'src/auth/dto/login.dto';

const originalEnv = process.env;

const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('UserService', () => {
  let service: UserService;
  let mockUserRepo: Record<keyof UserRepository, any>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    vi.mocked(plainToInstance).mockImplementation((cls, plain: any) => {
      const { password, ...safe } = plain;
      safe.createdAt =
        safe.createdAt instanceof Date
          ? safe.createdAt.getTime()
          : safe.createdAt;
      safe.updatedAt =
        safe.createdAt instanceof Date
          ? safe.createdAt.getTime()
          : safe.createdAt;
      if (password || !password) {
        return safe;
      }
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('create', () => {
    const createdUserDto: CreateUserDto = {
      login: 'testuser',
      password: 'plainPassword',
      role: Role.admin,
    };
    const hashedPassword = 'hashedPassword';

    it('should return a valid UserResponseDto', async () => {
      mockUserRepo.findByLogin.mockResolvedValue(null);
      vi.mocked(hash as Mock).mockResolvedValue(hashedPassword);

      const createdUser = new User({
        login: createdUserDto.login,
        password: hashedPassword,
        role: createdUserDto.role,
      });
      mockUserRepo.create.mockResolvedValue(createdUser);

      const result = await service.create(createdUserDto);

      expect(result.id).toMatch(uuidV4Regex);
      expect(result.login).toEqual(createdUserDto.login);
      expect(Object.values(Role)).toContain(result.role);
      expect(typeof result.createdAt).toBe('number');
      expect(typeof result.updatedAt).toBe('number');
      expect(result).not.toHaveProperty('password');
    });

    it('should hash password', async () => {
      mockUserRepo.findByLogin.mockResolvedValue(null);
      vi.mocked(hash as Mock).mockResolvedValue(hashedPassword);

      const createdUser = new User({
        login: createdUserDto.login,
        password: hashedPassword,
        role: createdUserDto.role,
      });
      mockUserRepo.create.mockResolvedValue(createdUser);

      await service.create(createdUserDto);

      expect(hash).toHaveBeenCalledTimes(1);
      expect(hash).toHaveBeenCalledWith(createdUserDto.password, 10);

      expect(mockUserRepo.create).toHaveBeenCalledTimes(1);
      const userArg = mockUserRepo.create.mock.calls[0][0];
      expect(userArg.password).toBe(hashedPassword);
    });

    it('should assign viewer role in case role is not provided', async () => {
      mockUserRepo.findByLogin.mockResolvedValue(null);
      vi.mocked(hash as Mock).mockResolvedValue(hashedPassword);

      const createdUserDtoWithoutRole: CreateUserDto = {
        login: 'testuser',
        password: 'plainPassword',
      };

      const createdUser = new User({
        login: createdUserDtoWithoutRole.login,
        password: hashedPassword,
      });
      mockUserRepo.create.mockResolvedValue(createdUser);

      const result = await service.create(createdUserDtoWithoutRole);

      expect(result.role).toEqual(Role.viewer);
    });

    it('should assign provider role', async () => {
      mockUserRepo.findByLogin.mockResolvedValue(null);
      vi.mocked(hash as Mock).mockResolvedValue(hashedPassword);

      const createdUser = new User({
        login: createdUserDto.login,
        password: hashedPassword,
        role: createdUserDto.role,
      });
      mockUserRepo.create.mockResolvedValue(createdUser);

      const result = await service.create(createdUserDto);

      expect(result.role).toEqual(createdUserDto.role);
    });

    it('should throw BadRequestException if login already exists', async () => {
      const existingUser = new User({
        login: 'testuser',
        password: 'hashed',
        role: 'viewer',
      });
      mockUserRepo.findByLogin.mockResolvedValue(existingUser);

      const signupPromise = service.create(createdUserDto);

      await expect(signupPromise).rejects.toThrow(BadRequestException);
      await expect(signupPromise).rejects.toThrow(
        'User with this login already exists',
      );

      expect(mockUserRepo.findByLogin).toHaveBeenCalledWith(existingUser.login);
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const id = 'fakeId';

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      const findOnePromise = service.findOne(id);

      await expect(findOnePromise).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const id = 'fakeId';
    const updatedUserDto: UpdatePasswordDto = {
      oldPassword: 'plainPassword',
      newPassword: 'newPlainPassword',
    };
    const hashedPassword = 'hashedPassword';
    const currentUser = new User({
      login: 'admin',
      password: hashedPassword,
      role: Role.admin,
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      const updatePromise = service.update(id, updatedUserDto, currentUser);

      await expect(updatePromise).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const id = 'fakeId';
    const hashedPassword = 'hashedPassword';
    const currentUser = new User({
      login: 'admin',
      password: hashedPassword,
      role: Role.admin,
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      const removePromise = service.remove(id, currentUser);

      await expect(removePromise).rejects.toThrow(NotFoundException);
    });
  });
});

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
    const hashedPassword = 'hashedPassword';

    it('should return user id, login and role', async () => {
      mockUserRepo.findByLogin.mockResolvedValue(null);
      vi.mocked(hash as Mock).mockResolvedValue(hashedPassword);

      const createdUser = new User({
        login: signupDto.login,
        password: hashedPassword,
      });
      mockUserRepo.create.mockResolvedValue(createdUser);

      const result = await service.signup(signupDto);
      expect(result.id).toMatch(uuidV4Regex);
      expect(result.login).toEqual(signupDto.login);
      expect(Object.values(Role)).toContain(result.role);
    });

    it('should hash password', async () => {
      mockUserRepo.findByLogin.mockResolvedValue(null);
      vi.mocked(hash as Mock).mockResolvedValue(hashedPassword);

      const createdUser = new User({
        login: signupDto.login,
        password: hashedPassword,
      });
      mockUserRepo.create.mockResolvedValue(createdUser);

      await service.signup(signupDto);

      expect(hash).toHaveBeenCalledTimes(1);
      expect(hash).toHaveBeenCalledWith(signupDto.password, 10);

      expect(mockUserRepo.create).toHaveBeenCalledTimes(1);
      const userArg = mockUserRepo.create.mock.calls[0][0];
      expect(userArg.password).toBe(hashedPassword);
    });

    it('should assign viewer role', async () => {
      mockUserRepo.findByLogin.mockResolvedValue(null);
      vi.mocked(hash as Mock).mockResolvedValue(hashedPassword);

      const createdUser = new User({
        login: signupDto.login,
        password: hashedPassword,
      });
      mockUserRepo.create.mockResolvedValue(createdUser);

      const result = await service.signup(signupDto);

      expect(result.role).toEqual(Role.viewer);
    });

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

      expect(mockUserRepo.findByLogin).toHaveBeenCalledWith(existingUser.login);
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      login: 'testuser',
      password: 'plainPassword',
    };

    it('should throw ForbiddenException if user not found', async () => {
      mockUserRepo.findByLogin.mockResolvedValue(null);

      const loginPromise = service.login(loginDto);

      await expect(loginPromise).rejects.toThrow(ForbiddenException);
    });
  });

  describe('refresh', () => {
    const refreshToken = 'fakeToken';

    it('should throwUnauthorizedException if user not found', async () => {
      const id = 'fakeId';
      const payload = {
        userId: id,
      };
      mockJwtService.verify.mockResolvedValue(payload);
      mockUserRepo.findById.mockResolvedValue(null);

      const refreshPromise = service.refresh(refreshToken);

      await expect(refreshPromise).rejects.toThrow(UnauthorizedException);
    });
  });
});
