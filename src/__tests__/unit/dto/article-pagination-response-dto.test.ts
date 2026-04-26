import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { plainToInstance } from 'class-transformer';

import { ArticlePaginationResponseDto } from 'src/modules/article/dto/article-pagination-response.dto';

import { ArticleResponseDto } from 'src/modules/article/dto/article-response.dto';

describe('ArticlePaginationResponseDto', () => {
  const article1 = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Article 1',
    content: 'Content 1',
    status: 'draft',
    authorId: null,
    categoryId: null,
    tags: ['nestjs'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const article2 = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Article 2',
    content: 'Content 2',
    status: 'published',
    authorId: null,
    categoryId: null,
    tags: ['typescript'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should transform plain object into pagination dto', () => {
    const payload = {
      total: 2,
      page: 1,
      limit: 10,
      data: [article1, article2],
    };

    const result = plainToInstance(ArticlePaginationResponseDto, payload);

    expect(result).toBeInstanceOf(ArticlePaginationResponseDto);

    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('should transform nested data items into ArticleResponseDto instances', () => {
    const payload = {
      total: 2,
      page: 1,
      limit: 10,
      data: [article1, article2],
    };

    const result = plainToInstance(ArticlePaginationResponseDto, payload);

    expect(result.data).toHaveLength(2);

    expect(result.data[0]).toBeInstanceOf(ArticleResponseDto);

    expect(result.data[1]).toBeInstanceOf(ArticleResponseDto);
  });

  it('should preserve article fields after transformation', () => {
    const payload = {
      total: 1,
      page: 1,
      limit: 10,
      data: [article1],
    };

    const result = plainToInstance(ArticlePaginationResponseDto, payload);

    expect(result.data[0].title).toBe('Article 1');

    expect(result.data[0].tags).toContain('nestjs');

    expect(result.data[0].status).toBe('draft');
  });

  it('should support empty paginated results', () => {
    const payload = {
      total: 0,
      page: 1,
      limit: 10,
      data: [],
    };

    const result = plainToInstance(ArticlePaginationResponseDto, payload);

    expect(result.total).toBe(0);
    expect(result.data).toEqual([]);
  });

  it('should map pagination metadata correctly', () => {
    const payload = {
      total: 42,
      page: 3,
      limit: 5,
      data: [],
    };

    const result = plainToInstance(ArticlePaginationResponseDto, payload);

    expect(result.total).toBe(42);
    expect(result.page).toBe(3);
    expect(result.limit).toBe(5);
  });
});
