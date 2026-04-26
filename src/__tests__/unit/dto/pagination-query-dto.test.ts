import { validate } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { describe, it, expect } from 'vitest';

describe('PaginationQueryDto', () => {
  it('should pass with default values when no data is provided', async () => {
    const dto = new PaginationQueryDto();

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('should pass with valid custom values', async () => {
    const dto = new PaginationQueryDto();
    dto.page = 5;
    dto.limit = 20;

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail when page is less than 1', async () => {
    const dto = new PaginationQueryDto();
    dto.page = 0;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const error = errors.find((e) => e.property === 'page');
    expect(error?.constraints).toHaveProperty('min');
  });

  it('should fail when limit is less than 1', async () => {
    const dto = new PaginationQueryDto();
    dto.limit = -10;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const error = errors.find((e) => e.property === 'limit');
    expect(error?.constraints).toHaveProperty('min');
  });

  it('should fail when values are not integers', async () => {
    const dto = new PaginationQueryDto();
    dto.page = 1.5;
    dto.limit = 10.7;

    const errors = await validate(dto);

    expect(errors.length).toBe(2);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('should fail when values are not numbers', async () => {
    const dto = new PaginationQueryDto();
    (dto as any).page = 'first-page';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });
});
