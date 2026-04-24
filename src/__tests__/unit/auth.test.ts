import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
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
import { ArticleStatus, Role } from '@prisma/client';
import { ArticleService } from 'src/modules/article/article.service';
import {
  ARTICLE_REPOSITORY,
  ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from 'src/domain/repositories/category.repository.interface';
import { CreateArticleDto } from 'src/modules/article/dto/create-article.dto';
import { UpdateArticleDto } from 'src/modules/article/dto/update-article.dto';
import { Article } from 'src/domain/entities/article.entity';
import { CommentService } from 'src/modules/comment/comment.service';
import {
  COMMENT_REPOSITORY,
  CommentRepository,
} from 'src/domain/repositories/comment.repository.interface';
import { CreateCommentDto } from 'src/modules/comment/dto/create-comment.dto';
import { Comment } from 'src/domain/entities/comment.entity';
import { UserService } from 'src/modules/user/user.service';
import { UpdatePasswordDto } from 'src/modules/user/dto/update-user.dto';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';

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
    const refreshToken = 'refresh-token';
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

    it('should generate new tokens on valid refresh', async () => {
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const storedToken = {
        token: refreshToken,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 100000),
      };
      mockTokenRepo.findByToken.mockResolvedValue(storedToken);

      const newAccessToken = 'newAccess';
      const newRefreshToken = 'newRefresh';
      mockJwtService.signAsync
        .mockResolvedValueOnce(newAccessToken)
        .mockResolvedValueOnce(newRefreshToken);

      const result = await service.refresh(refreshToken);

      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

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
    });

    it('should throw ForbiddenException if stored token is expired', async () => {
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const expiredToken = {
        token: refreshToken,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() - 1000),
      };
      mockTokenRepo.findByToken.mockResolvedValue(expiredToken);

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockTokenRepo.delete).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should verify token with correct secret and throw ForbiddenException if verification fails', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        'Invalid or expired refresh token',
      );

      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      expect(mockUserRepo.findById).not.toHaveBeenCalled();
      expect(mockTokenRepo.findByToken).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if token verification returns null payload', async () => {
      mockJwtService.verify.mockReturnValue(null);
      await expect(service.refresh(refreshToken)).rejects.toThrow();
      expect(mockUserRepo.findById).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if token not found in repository', async () => {
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUserRepo.findById.mockResolvedValue(mockUser);

      mockTokenRepo.findByToken.mockResolvedValue(null);

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should delete the old refresh token and save a new one (rotation)', async () => {
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUserRepo.findById.mockResolvedValue(mockUser);
      const storedToken = {
        token: refreshToken,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 100000),
      };
      mockTokenRepo.findByToken.mockResolvedValue(storedToken);

      const newAccess = 'new-access';
      const newRefresh = 'new-refresh';
      mockJwtService.signAsync
        .mockResolvedValueOnce(newAccess)
        .mockResolvedValueOnce(newRefresh);

      await service.refresh(refreshToken);

      expect(mockTokenRepo.delete).toHaveBeenCalledWith(refreshToken);
      expect(mockTokenRepo.create).toHaveBeenCalledWith(
        newRefresh,
        mockUser.id,
        expect.any(Date),
      );
    });

    it('should not generate new tokens if deletion of old token fails', async () => {
      mockTokenRepo.delete.mockRejectedValue(new Error());

      await expect(service.refresh(refreshToken)).rejects.toThrow();

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
      expect(mockTokenRepo.create).not.toHaveBeenCalled();
    });

    it('should invalidate the old token after a successful rotation', async () => {
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUserRepo.findById.mockResolvedValue(mockUser);
      const storedToken = {
        token: refreshToken,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 100000),
      };
      mockTokenRepo.findByToken.mockResolvedValue(storedToken);

      const newAccess = 'new-access';
      const newRefresh = 'new-refresh';
      mockJwtService.signAsync
        .mockResolvedValueOnce(newAccess)
        .mockResolvedValueOnce(newRefresh);

      await service.refresh(refreshToken);

      mockTokenRepo.findByToken.mockResolvedValue(null);

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });
  });
});

describe('ArticleService', () => {
  let service: ArticleService;
  let mockArticleRepo: Record<keyof ArticleRepository, any>;
  let mockUserRepo: Record<keyof UserRepository, any>;
  let mockCategoryRepo: Record<keyof CategoryRepository, any>;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockArticleRepo = {
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    } as any;

    mockUserRepo = {
      findById: vi.fn(),
    } as any;

    mockCategoryRepo = {
      findById: vi.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: ARTICLE_REPOSITORY,
          useValue: mockArticleRepo,
        },
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepo,
        },
        {
          provide: CATEGORY_REPOSITORY,
          useValue: mockCategoryRepo,
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
  });

  describe('update and delete', () => {
    const id = 'fakeId';
    const currentUser = new User({
      login: 'admin',
      password: 'hashedPassword',
      role: Role.editor,
    });
    const createdArticleDto: CreateArticleDto = {
      title: 'TEST_ARTICLE',
      content: 'Test article content',
      status: 'draft',
      authorId: null,
      categoryId: null,
      tags: [],
    };

    it('should throw ForbiddenException in update method if no permissions due to RBAC', async () => {
      const article = new Article(createdArticleDto);
      const newStatus = ArticleStatus.published;
      const updateArticleDto: UpdateArticleDto = {
        status: newStatus,
      };
      mockArticleRepo.findById.mockResolvedValue(article);

      const updatePromise = service.update(id, updateArticleDto, currentUser);

      await expect(updatePromise).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException in delete method if no permissions due to RBAC', async () => {
      const article = new Article(createdArticleDto);
      mockArticleRepo.findById.mockResolvedValue(article);

      const deletePromise = service.remove(id, currentUser);

      await expect(deletePromise).rejects.toThrow(ForbiddenException);
    });
  });
});

describe('CommentService', () => {
  let service: CommentService;
  let mockArticleRepo: Record<keyof ArticleRepository, any>;
  let mockUserRepo: Record<keyof UserRepository, any>;
  let mockCommentRepo: Record<keyof CommentRepository, any>;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockArticleRepo = {
      findById: vi.fn(),
    } as any;

    mockUserRepo = {
      findById: vi.fn(),
    } as any;

    mockCommentRepo = {
      findById: vi.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: ARTICLE_REPOSITORY,
          useValue: mockArticleRepo,
        },
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepo,
        },
        {
          provide: COMMENT_REPOSITORY,
          useValue: mockCommentRepo,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  describe('delete', () => {
    const id = 'fakeId';
    const currentUser = new User({
      login: 'admin',
      password: 'hashedPassword',
      role: Role.editor,
    });
    const createCommentDto: CreateCommentDto = {
      content: 'Test article content',
      articleId: 'fakeIf',
    };

    it('should throw ForbiddenException if no permissions due to RBAC', async () => {
      const comment = new Comment(createCommentDto);
      mockCommentRepo.findById.mockResolvedValue(comment);

      const deletePromise = service.remove(id, currentUser);

      await expect(deletePromise).rejects.toThrow(ForbiddenException);
    });
  });
});

describe('UserService', () => {
  let service: UserService;
  let mockUserRepo: Record<keyof UserRepository, any>;
  const id = 'fakeId';
  const currentUser = new User({
    login: 'admin',
    password: 'hashedPassword',
    role: Role.editor,
  });
  const createdUserDto: CreateUserDto = {
    login: 'testuser',
    password: 'plainPassword',
    role: Role.admin,
  };

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
  });

  afterEach(() => {
    process.env = originalEnv;
  });
  describe('update and delete', () => {
    it('should throw ForbiddenException in update method if no permissions due to RBAC', async () => {
      const user = new User(createdUserDto);
      const updatedUserDto: UpdatePasswordDto = {
        oldPassword: 'plainPassword',
        newPassword: 'newPlainPassword',
      };
      mockUserRepo.findById.mockResolvedValue(user);

      const updatePromise = service.update(id, updatedUserDto, currentUser);

      await expect(updatePromise).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException in delete method if no permissions due to RBAC', async () => {
      const user = new User(createdUserDto);
      mockUserRepo.findById.mockResolvedValue(user);

      const deletePromise = service.remove(id, currentUser);

      await expect(deletePromise).rejects.toThrow(ForbiddenException);
    });
  });
});
