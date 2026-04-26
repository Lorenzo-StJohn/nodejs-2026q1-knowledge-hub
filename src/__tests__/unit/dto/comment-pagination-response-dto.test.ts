import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { plainToInstance } from 'class-transformer';

import { CommentPaginationResponseDto } from 'src/modules/comment/dto/comment-pagination-response.dto';

import { CommentResponseDto } from 'src/modules/comment/dto/comment-response.dto';

describe('CommentPaginationResponseDto', () => {
  const comment1 = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    content: 'First comment',
    authorId: '550e8400-e29b-41d4-a716-446655440010',
    articleId: '550e8400-e29b-41d4-a716-446655440020',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const comment2 = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    content: 'Second comment',
    authorId: '550e8400-e29b-41d4-a716-446655440011',
    articleId: '550e8400-e29b-41d4-a716-446655440021',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should transform plain object into pagination dto', () => {
    const payload = {
      total: 2,
      page: 1,
      limit: 10,
      data: [comment1, comment2],
    };

    const result = plainToInstance(CommentPaginationResponseDto, payload);

    expect(result).toBeInstanceOf(CommentPaginationResponseDto);

    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('should transform nested comments into CommentResponseDto instances', () => {
    const payload = {
      total: 2,
      page: 1,
      limit: 10,
      data: [comment1, comment2],
    };

    const result = plainToInstance(CommentPaginationResponseDto, payload);

    expect(result.data).toHaveLength(2);

    expect(result.data[0]).toBeInstanceOf(CommentResponseDto);

    expect(result.data[1]).toBeInstanceOf(CommentResponseDto);
  });

  it('should preserve comment fields after transformation', () => {
    const payload = {
      total: 1,
      page: 1,
      limit: 10,
      data: [comment1],
    };

    const result = plainToInstance(CommentPaginationResponseDto, payload);

    expect(result.data[0].content).toBe('First comment');

    expect(result.data[0].authorId).toBe(comment1.authorId);

    expect(result.data[0].articleId).toBe(comment1.articleId);
  });

  it('should support empty paginated results', () => {
    const payload = {
      total: 0,
      page: 1,
      limit: 10,
      data: [],
    };

    const result = plainToInstance(CommentPaginationResponseDto, payload);

    expect(result.total).toBe(0);
    expect(result.data).toEqual([]);
  });

  it('should map pagination metadata correctly', () => {
    const payload = {
      total: 27,
      page: 3,
      limit: 5,
      data: [],
    };

    const result = plainToInstance(CommentPaginationResponseDto, payload);

    expect(result.total).toBe(27);
    expect(result.page).toBe(3);
    expect(result.limit).toBe(5);
  });
});
