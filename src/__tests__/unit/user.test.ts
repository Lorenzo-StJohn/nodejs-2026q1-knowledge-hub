import { Test, TestingModule } from '@nestjs/testing';
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

import { hash, compare } from 'bcryptjs';

import { Role } from '@prisma/client';
import { UserService } from 'src/modules/user/user.service';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { UpdatePasswordDto } from 'src/modules/user/dto/update-user.dto';
import { LoginDto } from 'src/auth/dto/login.dto';
import { UserPaginationResponseDto } from 'src/modules/user/dto/user-pagination-response.dto';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from 'src/common/exceptions/custom-errors';

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
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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
        safe.updatedAt instanceof Date
          ? safe.updatedAt.getTime()
          : safe.updatedAt;
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

    it('should throw ValidationError if login already exists', async () => {
      const existingUser = new User({
        login: 'testuser',
        password: 'hashed',
        role: 'viewer',
      });
      mockUserRepo.findByLogin.mockResolvedValue(existingUser);

      const signupPromise = service.create(createdUserDto);

      await expect(signupPromise).rejects.toThrow(ValidationError);

      expect(mockUserRepo.findByLogin).toHaveBeenCalledWith(existingUser.login);
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const id = 'fakeId';

    it('should throw NotFoundError if user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      const findOnePromise = service.findOne(id);

      await expect(findOnePromise).rejects.toThrow(NotFoundError);
    });

    it('should return user if found', async () => {
      const hashPassword = 'hashpassword';
      const user = new User({
        login: 'test',
        password: hashPassword,
        role: Role.viewer,
      });
      mockUserRepo.findById.mockResolvedValue(user);

      const result = await service.findOne(id);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(id);
      expect(plainToInstance).toHaveBeenCalledWith(UserResponseDto, user, {
        excludeExtraneousValues: true,
      });
      expect(result).toEqual({
        id: user.id,
        login: user.login,
        role: user.role,
        createdAt: user.createdAt.getTime(),
        updatedAt: user.updatedAt.getTime(),
      });
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

    it('should throw NotFoundError if user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      const updatePromise = service.update(id, updatedUserDto, currentUser);

      await expect(updatePromise).rejects.toThrow(NotFoundError);
    });

    it('should hash password', async () => {
      const newHashedPassword = 'newhashedpassword';
      const oldUser = new User({
        login: 'testuser',
        password: hashedPassword,
      });
      const updatedUser = new User({
        login: oldUser.login,
        password: newHashedPassword,
      });

      mockUserRepo.findById.mockResolvedValue(oldUser);
      mockUserRepo.update.mockResolvedValue(updatedUser);
      vi.mocked(hash as Mock).mockResolvedValue(newHashedPassword);
      vi.mocked(compare as Mock).mockResolvedValue(true);

      await service.update(id, updatedUserDto, currentUser);

      expect(hash).toHaveBeenCalledTimes(1);
      expect(hash).toHaveBeenCalledWith(updatedUserDto.newPassword, 10);

      expect(mockUserRepo.update).toHaveBeenCalledTimes(1);
      const userArg = mockUserRepo.update.mock.calls[0][1];
      expect(userArg.password).toBe(newHashedPassword);
    });

    it('should throw ForbiddenError if old password is wrong', async () => {
      mockUserRepo.findById.mockResolvedValue(currentUser);
      vi.mocked(compare as Mock).mockResolvedValue(false);

      const updatePromise = service.update(id, updatedUserDto, currentUser);
      await expect(updatePromise).rejects.toThrow(ForbiddenError);
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

    it('should throw NotFoundError if user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      const removePromise = service.remove(id, currentUser);

      await expect(removePromise).rejects.toThrow(NotFoundError);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const filters = { page: 1, limit: 10 };
      const users = {
        data: [new User({ login: 'testuser', password: 'hashedPassword' })],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockUserRepo.findAll.mockResolvedValue(users);

      const result = await service.findAll(filters);

      expect(mockUserRepo.findAll).toHaveBeenCalledWith(filters);
      expect(plainToInstance).toHaveBeenCalledWith(
        UserPaginationResponseDto,
        users,
        {
          excludeExtraneousValues: true,
        },
      );
      expect(result).toEqual(users);
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

    it('should throw ValidationError if login already exists', async () => {
      const existingUser = new User({
        login: 'testuser',
        password: 'hashed',
        role: 'viewer',
      });
      mockUserRepo.findByLogin.mockResolvedValue(existingUser);

      const signupPromise = service.signup(signupDto);

      await expect(signupPromise).rejects.toThrow(ValidationError);

      expect(mockUserRepo.findByLogin).toHaveBeenCalledWith(existingUser.login);
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });
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

    it('should throw ForbiddenError if user not found', async () => {
      mockUserRepo.findByLogin.mockResolvedValue(null);

      const loginPromise = service.login(loginDto);

      await expect(loginPromise).rejects.toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError if password is incorrect', async () => {
      mockUserRepo.findByLogin.mockResolvedValue(mockUser);
      vi.mocked(compare as Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenError);
      expect(compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should delete token and return success message', async () => {
      const token = 'some-refresh-token';
      mockTokenRepo.delete.mockResolvedValue(undefined);

      const result = await service.logout(token);
      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockTokenRepo.delete).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedError if refresh token is empty', async () => {
      await expect(service.logout('')).rejects.toThrow(UnauthorizedError);
      expect(mockTokenRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    const refreshToken = 'fakeToken';

    it('should throw UnauthorizedError if user not found', async () => {
      const id = 'fakeId';
      const payload = {
        userId: id,
      };
      mockJwtService.verify.mockResolvedValue(payload);
      mockUserRepo.findById.mockResolvedValue(null);

      const refreshPromise = service.refresh(refreshToken);

      await expect(refreshPromise).rejects.toThrow(UnauthorizedError);
    });
  });
});
