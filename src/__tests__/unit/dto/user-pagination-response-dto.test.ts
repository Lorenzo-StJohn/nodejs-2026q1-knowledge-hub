import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { plainToInstance } from 'class-transformer';

import { UserPaginationResponseDto } from 'src/modules/user/dto/user-pagination-response.dto';

import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

describe('UserPaginationResponseDto', () => {
  const user1 = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    login: 'alice',
    role: 'viewer',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const user2 = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    login: 'bob',
    role: 'editor',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should transform plain object into UserPaginationResponseDto', () => {
    const payload = {
      total: 2,
      page: 1,
      limit: 10,
      data: [user1, user2],
    };

    const result = plainToInstance(UserPaginationResponseDto, payload);

    expect(result).toBeInstanceOf(UserPaginationResponseDto);

    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('should transform nested users into UserResponseDto instances', () => {
    const payload = {
      total: 2,
      page: 1,
      limit: 10,
      data: [user1, user2],
    };

    const result = plainToInstance(UserPaginationResponseDto, payload);

    expect(result.data).toHaveLength(2);

    expect(result.data[0]).toBeInstanceOf(UserResponseDto);

    expect(result.data[1]).toBeInstanceOf(UserResponseDto);
  });

  it('should preserve user fields after transformation', () => {
    const payload = {
      total: 1,
      page: 1,
      limit: 10,
      data: [user1],
    };

    const result = plainToInstance(UserPaginationResponseDto, payload);

    expect(result.data[0].login).toBe('alice');

    expect(result.data[0].role).toBe('viewer');

    expect(result.data[0].id).toBe(user1.id);
  });

  it('should support empty paginated results', () => {
    const payload = {
      total: 0,
      page: 1,
      limit: 10,
      data: [],
    };

    const result = plainToInstance(UserPaginationResponseDto, payload);

    expect(result.total).toBe(0);
    expect(result.data).toEqual([]);
  });

  it('should map pagination metadata correctly', () => {
    const payload = {
      total: 53,
      page: 4,
      limit: 15,
      data: [],
    };

    const result = plainToInstance(UserPaginationResponseDto, payload);

    expect(result.total).toBe(53);
    expect(result.page).toBe(4);
    expect(result.limit).toBe(15);
  });
});
