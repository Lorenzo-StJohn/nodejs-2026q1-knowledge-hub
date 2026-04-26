import { Test, TestingModule } from '@nestjs/testing';
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
import {
  ValidationError,
  NotFoundError,
} from 'src/common/exceptions/custom-errors';

vi.mock('class-transformer', async (importOriginal) => {
  const actual = await importOriginal<typeof import('class-transformer')>();
  return {
    ...actual,
    plainToInstance: vi.fn(),
  };
});

const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('ArticleService', () => {
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
      findAll: vi.fn(),
      delete: vi.fn(),
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
        safe.updatedAt instanceof Date
          ? safe.updatedAt.getTime()
          : safe.updatedAt;
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

    it('should throw ValidationError if user id does not exist', async () => {
      const authorId = 'fakeId';
      const createdArticle = new Article({ ...createdArticleDto, authorId });
      mockArticleRepo.create.mockResolvedValue(createdArticle);
      mockUserRepo.findById.mockResolvedValue(null);

      const createPromise = service.create({ ...createdArticleDto, authorId });

      await expect(createPromise).rejects.toThrow(ValidationError);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(authorId);
      expect(mockArticleRepo.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if category id does not exist', async () => {
      const categoryId = 'fakeId';
      const createdArticle = new Article({ ...createdArticleDto, categoryId });
      mockArticleRepo.create.mockResolvedValue(createdArticle);
      mockCategoryRepo.findById.mockResolvedValue(null);

      const createPromise = service.create({
        ...createdArticleDto,
        categoryId,
      });

      await expect(createPromise).rejects.toThrow(ValidationError);

      expect(mockCategoryRepo.findById).toHaveBeenCalledWith(categoryId);
      expect(mockArticleRepo.create).not.toHaveBeenCalled();
    });

    it('should successfully create article with valid authorId and categoryId', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const validCategoryUuid = '550e8400-e29b-41d4-a716-446655440001';

      const dto = {
        ...createdArticleDto,
        authorId: validUuid,
        categoryId: validCategoryUuid,
      };
      const createdArticle = new Article(dto);

      mockUserRepo.findById.mockResolvedValue({ id: validUuid });
      mockCategoryRepo.findById.mockResolvedValue({ id: validCategoryUuid });
      mockArticleRepo.create.mockResolvedValue(createdArticle);

      const result = await service.create(dto);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(validUuid);
      expect(mockCategoryRepo.findById).toHaveBeenCalledWith(validCategoryUuid);
      expect(result.id).toBeDefined();
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

    it('should throw NotFoundError if article not found', async () => {
      mockArticleRepo.findById.mockResolvedValue(null);
      await expect(
        service.update(id, {} as UpdateArticleDto, currentUser),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError  when transitioning from draft to archived (invalid)', async () => {
      const article = new Article(createdArticleDto);
      const newStatus = ArticleStatus.archived;
      const updateArticleDto: UpdateArticleDto = {
        status: newStatus,
      };
      mockArticleRepo.findById.mockResolvedValue(article);

      const updatePromise = service.update(id, updateArticleDto, currentUser);

      await expect(updatePromise).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when transitioning from published to draft (invalid)', async () => {
      const article = new Article({
        ...createdArticleDto,
        status: ArticleStatus.published,
      });
      mockArticleRepo.findById.mockResolvedValue(article);

      await expect(
        service.update(
          id,
          { status: ArticleStatus.draft } as UpdateArticleDto,
          currentUser,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for any transition from archived', async () => {
      const article = new Article({
        ...createdArticleDto,
        status: ArticleStatus.archived,
      });
      const newStatus = ArticleStatus.published;
      const updateArticleDto: UpdateArticleDto = {
        status: newStatus,
      };
      mockArticleRepo.findById.mockResolvedValue(article);

      const updatePromise = service.update(id, updateArticleDto, currentUser);

      await expect(updatePromise).rejects.toThrow(ValidationError);
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

    it('should update article with a valid new authorId', async () => {
      const article = new Article(createdArticleDto);
      const newAuthorId = '550e8400-e29b-41d4-a716-446655440000';
      const updateDto: UpdateArticleDto = { authorId: newAuthorId };

      mockArticleRepo.findById.mockResolvedValue(article);
      mockUserRepo.findById.mockResolvedValue({ id: newAuthorId });
      const updatedArticle = { ...article, authorId: newAuthorId };
      mockArticleRepo.update.mockResolvedValue(updatedArticle);

      const result = await service.update(article.id, updateDto, currentUser);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(newAuthorId);
      expect(mockArticleRepo.update).toHaveBeenCalledWith(
        article.id,
        expect.objectContaining({ authorId: newAuthorId }),
      );
      expect(result.authorId).toBe(newAuthorId);
    });
  });

  describe('findAll filtering logic', () => {
    const article1 = new Article({
      ...createdArticleDto,
      title: 'Draft TS',
      status: ArticleStatus.draft,
      categoryId: 'cat-1',
      tags: ['typescript'],
    });

    const article2 = new Article({
      ...createdArticleDto,
      title: 'Published Nest',
      status: ArticleStatus.published,
      categoryId: 'cat-2',
      tags: ['nestjs'],
    });

    it('should filter articles by status', async () => {
      const filters = {
        status: ArticleStatus.published,
        page: 1,
        limit: 10,
      };

      mockArticleRepo.findAll.mockResolvedValue({
        data: [article2],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll(filters);

      expect(mockArticleRepo.findAll).toHaveBeenCalledWith(filters);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(ArticleStatus.published);
    });

    it('should filter articles by categoryId', async () => {
      const filters = {
        categoryId: 'cat-1',
        page: 1,
        limit: 10,
      };

      mockArticleRepo.findAll.mockResolvedValue({
        data: [article1],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll(filters);

      expect(mockArticleRepo.findAll).toHaveBeenCalledWith(filters);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].categoryId).toBe('cat-1');
    });

    it('should filter articles by tag', async () => {
      const filters = {
        tag: 'nestjs',
        page: 1,
        limit: 10,
      };

      mockArticleRepo.findAll.mockResolvedValue({
        data: [article2],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll(filters);

      expect(mockArticleRepo.findAll).toHaveBeenCalledWith(filters);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].tags).toContain('nestjs');
    });

    it('should filter articles using combined filters', async () => {
      const filters = {
        status: ArticleStatus.published,
        categoryId: 'cat-2',
        tag: 'nestjs',
        page: 1,
        limit: 10,
      };

      mockArticleRepo.findAll.mockResolvedValue({
        data: [article2],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll(filters);

      expect(mockArticleRepo.findAll).toHaveBeenCalledWith(filters);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(ArticleStatus.published);
      expect(result.data[0].categoryId).toBe('cat-2');
      expect(result.data[0].tags).toContain('nestjs');
    });

    it('should return empty result when no articles match filters', async () => {
      const filters = {
        tag: 'nonexistent',
        page: 1,
        limit: 10,
      };

      mockArticleRepo.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
      });

      const result = await service.findAll(filters);

      expect(mockArticleRepo.findAll).toHaveBeenCalledWith(filters);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return the article if found', async () => {
      const article = new Article(createdArticleDto);
      mockArticleRepo.findById.mockResolvedValue(article);

      const result = await service.findOne(article.id);

      expect(result.id).toBe(article.id);
      expect(result.title).toBe(article.title);
    });

    it('should throw NotFoundError if article not found', async () => {
      mockArticleRepo.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('remove', () => {
    const id = 'fakeId';
    const currentAdmin = new User({
      login: 'admin',
      password: 'hashedPassword',
      role: Role.admin,
    });

    it('should throw NotFoundError if article not found', async () => {
      mockArticleRepo.findById.mockResolvedValue(null);
      await expect(service.remove(id, currentAdmin)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
