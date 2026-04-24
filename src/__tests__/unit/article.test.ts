import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  ARTICLE_REPOSITORY,
  type ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/domain/repositories/user.repository.interface';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from 'src/domain/repositories/category.repository.interface';
import { ArticleService } from 'src/modules/article/article.service';
import { CreateArticleDto } from 'src/modules/article/dto/create-article.dto';
import { plainToInstance } from 'class-transformer';
import { Article } from 'src/domain/entities/article.entity';
import { ArticleStatus, Role } from '@prisma/client';
import { User } from 'src/domain/entities/user.entity';
import { UpdateArticleDto } from 'src/modules/article/dto/update-article.dto';

vi.mock('class-transformer', async (importOriginal) => {
  const actual = await importOriginal<typeof import('class-transformer')>();
  return {
    ...actual,
    plainToInstance: vi.fn(),
  };
});

const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('UserService', () => {
  let service: ArticleService;
  let mockArticleRepo: Record<keyof ArticleRepository, any>;
  let mockUserRepo: Record<keyof UserRepository, any>;
  let mockCategoryRepo: Record<keyof CategoryRepository, any>;

  const createdArticleDto: CreateArticleDto = {
    title: 'TEST_ARTICLE',
    content: 'Test article content',
    status: 'draft',
    authorId: null,
    categoryId: null,
    tags: [],
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockArticleRepo = {
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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

    vi.mocked(plainToInstance).mockImplementation((cls, plain: any) => {
      const { ...safe } = plain;
      safe.createdAt =
        safe.createdAt instanceof Date
          ? safe.createdAt.getTime()
          : safe.createdAt;
      safe.updatedAt =
        safe.createdAt instanceof Date
          ? safe.createdAt.getTime()
          : safe.createdAt;
      return safe;
    });
  });

  describe('create', () => {
    it('should return a valid ArticleResponseDto', async () => {
      const createdArticle = new Article(createdArticleDto);
      mockArticleRepo.create.mockResolvedValue(createdArticle);

      const result = await service.create(createdArticleDto);

      expect(result.id).toMatch(uuidV4Regex);
      expect(result.title).toEqual(createdArticle.title);
      expect(result.content).toEqual(createdArticle.content);
      expect(Object.values(ArticleStatus)).toContain(result.status);
      expect(result.authorId).toEqual(createdArticle.authorId);
      expect(result.categoryId).toEqual(createdArticle.categoryId);
      expect(result.tags).toEqual(createdArticle.tags);
      expect(typeof result.createdAt).toBe('number');
      expect(typeof result.updatedAt).toBe('number');
    });

    it('should throw BadRequestException if user id does not exist', async () => {
      const authorId = 'fakeId';
      const createdArticle = new Article({ ...createdArticleDto, authorId });
      mockArticleRepo.create.mockResolvedValue(createdArticle);
      mockUserRepo.findById.mockResolvedValue(null);

      const createPromise = service.create({ ...createdArticleDto, authorId });

      await expect(createPromise).rejects.toThrow(BadRequestException);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(authorId);
      expect(mockArticleRepo.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if category id does not exist', async () => {
      const categoryId = 'fakeId';
      const createdArticle = new Article({ ...createdArticleDto, categoryId });
      mockArticleRepo.create.mockResolvedValue(createdArticle);
      mockCategoryRepo.findById.mockResolvedValue(null);

      const createPromise = service.create({
        ...createdArticleDto,
        categoryId,
      });

      await expect(createPromise).rejects.toThrow(BadRequestException);

      expect(mockCategoryRepo.findById).toHaveBeenCalledWith(categoryId);
      expect(mockArticleRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const id = 'fakeId';
    const currentUser = new User({
      login: 'admin',
      password: 'hashedPassword',
      role: Role.admin,
    });

    it('should update article if status transition is valid', async () => {
      const article = new Article(createdArticleDto);
      const newStatus = ArticleStatus.published;
      const updateArticleDto: UpdateArticleDto = {
        status: newStatus,
      };
      mockArticleRepo.findById.mockResolvedValue(article);
      mockArticleRepo.update.mockResolvedValue({
        ...article,
        status: newStatus,
      });

      const result = await service.update(id, updateArticleDto, currentUser);

      expect(result.status).toBe(newStatus);
    });

    it('should throw BadRequestException if status transition is invalid', async () => {
      const article = new Article(createdArticleDto);
      const newStatus = ArticleStatus.archived;
      const updateArticleDto: UpdateArticleDto = {
        status: newStatus,
      };
      mockArticleRepo.findById.mockResolvedValue(article);

      const updatePromise = service.update(id, updateArticleDto, currentUser);

      await expect(updatePromise).rejects.toThrow(BadRequestException);
    });

    it('should update tags', async () => {
      const article = new Article(createdArticleDto);
      const newTags = ['testtag'];
      const updateArticleDto: UpdateArticleDto = {
        tags: newTags,
      };
      mockArticleRepo.findById.mockResolvedValue(article);
      mockArticleRepo.update.mockResolvedValue({
        ...article,
        tags: newTags,
      });

      const result = await service.update(id, updateArticleDto, currentUser);

      expect(result.tags).toBe(newTags);
    });
  });
});
