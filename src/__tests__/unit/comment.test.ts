import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  COMMENT_REPOSITORY,
  CommentRepository,
} from 'src/domain/repositories/comment.repository.interface';
import {
  ARTICLE_REPOSITORY,
  ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/domain/repositories/user.repository.interface';
import { Comment } from 'src/domain/entities/comment.entity';
import { plainToInstance } from 'class-transformer';
import { Role } from '@prisma/client';
import { CommentService } from 'src/modules/comment/comment.service';
import { CreateCommentDto } from 'src/modules/comment/dto/create-comment.dto';
import { Article } from 'src/domain/entities/article.entity';
import { CommentResponseDto } from 'src/modules/comment/dto/comment-response.dto';
import { CommentPaginationResponseDto } from 'src/modules/comment/dto/comment-pagination-response.dto';

vi.mock('class-transformer', async (importOriginal) => {
  const actual = await importOriginal<typeof import('class-transformer')>();
  return {
    ...actual,
    plainToInstance: vi.fn(),
  };
});

describe('CommentService', () => {
  let service: CommentService;
  let mockCommentRepo: jest.Mocked<CommentRepository>;
  let mockArticleRepo: jest.Mocked<ArticleRepository>;
  let mockUserRepo: jest.Mocked<UserRepository>;

  const validUuid = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    vi.clearAllMocks();

    mockCommentRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    } as any;

    mockArticleRepo = {
      findById: vi.fn(),
    } as any;

    mockUserRepo = {
      findById: vi.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: COMMENT_REPOSITORY, useValue: mockCommentRepo },
        { provide: ARTICLE_REPOSITORY, useValue: mockArticleRepo },
        { provide: USER_REPOSITORY, useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);

    vi.mocked(plainToInstance).mockImplementation((cls, plain: any) => plain);
  });

  describe('create', () => {
    const dto: CreateCommentDto = {
      content: 'Great article!',
      articleId: validUuid,
      authorId: null,
    };

    it('should create a comment when article exists', async () => {
      const article = new Article({
        title: 'TEST_ARTICLE',
        content: 'Test article content',
        status: 'draft',
        authorId: null,
        categoryId: null,
        tags: [],
      });
      mockArticleRepo.findById.mockResolvedValue(article);
      const createdComment = new Comment(dto);
      mockCommentRepo.create.mockResolvedValue(createdComment);

      const result = await service.create(dto);

      expect(mockArticleRepo.findById).toHaveBeenCalledWith(validUuid);
      expect(mockCommentRepo.create).toHaveBeenCalledWith(expect.any(Comment));
      const commentArg = mockCommentRepo.create.mock.calls[0][0];
      expect(commentArg.content).toBe(dto.content);
      expect(commentArg.articleId).toBe(dto.articleId);
      expect(commentArg.authorId).toBeNull();
      expect(plainToInstance).toHaveBeenCalledWith(
        CommentResponseDto,
        createdComment,
      );
      expect(result).toEqual(createdComment);
    });

    it('should throw UnprocessableEntityException if article not found', async () => {
      mockArticleRepo.findById.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(mockCommentRepo.create).not.toHaveBeenCalled();
    });

    it('should validate authorId when provided', async () => {
      const dtoWithAuthor = { ...dto, authorId: validUuid };
      const article = { id: validUuid };
      const user = { id: validUuid };
      mockArticleRepo.findById.mockResolvedValue(article as any);
      mockUserRepo.findById.mockResolvedValue(user as any);
      const createdComment = { id: 'comment-2', ...dtoWithAuthor };
      mockCommentRepo.create.mockResolvedValue(createdComment as any);

      const result = await service.create(dtoWithAuthor);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(validUuid);
      expect(result).toEqual(createdComment);
    });

    it('should throw BadRequestException if authorId does not exist', async () => {
      const dtoWithAuthor = { ...dto, authorId: validUuid };
      mockArticleRepo.findById.mockResolvedValue({ id: validUuid } as any);
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(service.create(dtoWithAuthor)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockCommentRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a comment when found', async () => {
      const comment = { id: 'c1', content: 'Nice', articleId: validUuid };
      mockCommentRepo.findById.mockResolvedValue(comment as any);

      const result = await service.findOne('c1');

      expect(mockCommentRepo.findById).toHaveBeenCalledWith('c1');
      expect(plainToInstance).toHaveBeenCalledWith(CommentResponseDto, comment);
      expect(result).toEqual(comment);
    });

    it('should throw NotFoundException when comment not found', async () => {
      mockCommentRepo.findById.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated comments', async () => {
      const filters = { articleId: validUuid, page: 1, limit: 10 };
      const paginatedResult = {
        data: [{ id: 'c1' }],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockCommentRepo.findAll.mockResolvedValue(paginatedResult as any);

      const result = await service.findAll(filters);

      expect(mockCommentRepo.findAll).toHaveBeenCalledWith(filters);
      expect(plainToInstance).toHaveBeenCalledWith(
        CommentPaginationResponseDto,
        paginatedResult,
      );
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('remove', () => {
    const commentId = 'c1';
    const currentUserAdmin = { id: 'admin-1', role: Role.admin };

    it('should throw NotFoundException if comment not found', async () => {
      mockCommentRepo.findById.mockResolvedValue(null);

      await expect(service.remove(commentId, currentUserAdmin)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCommentRepo.delete).not.toHaveBeenCalled();
    });
  });
});
