import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { ArticleStatus } from '@prisma/client';
import { FindArticlesQueryDto } from 'src/modules/article/dto/find-articles-query.dto';
import { Order } from 'src/common/entities/sort.interface';

describe('FindArticlesQueryDto', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000';

  it('should pass with a full valid payload', async () => {
    const dto = new FindArticlesQueryDto();
    dto.status = ArticleStatus.draft;
    dto.categoryId = validUuid;
    dto.tag = 'nestjs';
    dto.sortBy = 'title';
    dto.order = Order[0];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when all optional fields are omitted', async () => {
    const dto = new FindArticlesQueryDto();
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail for invalid status enum', async () => {
    const dto = new FindArticlesQueryDto();
    (dto as any).status = 'unknown-status';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'status' && e.constraints?.isEnum),
    ).toBe(true);
  });

  it('should fail for invalid categoryId (not UUID v4)', async () => {
    const dto = new FindArticlesQueryDto();
    dto.categoryId = 'not-a-uuid';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'categoryId' && e.constraints?.isUuid),
    ).toBe(true);
  });

  it('should fail when categoryId is an empty string (UUID expects a string but pattern fails)', async () => {
    const dto = new FindArticlesQueryDto();
    dto.categoryId = '';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'categoryId' && e.constraints?.isUuid),
    ).toBe(true);
  });

  it('should fail when tag is an empty string', async () => {
    const dto = new FindArticlesQueryDto();
    dto.tag = '';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'tag' && e.constraints?.isNotEmpty),
    ).toBe(true);
  });

  it('should fail when tag is missing (but not empty) — actually it is optional, but if not provided no error', async () => {
    const dto = new FindArticlesQueryDto();
    const errors = await validate(dto);
    expect(errors.filter((e) => e.property === 'tag')).toHaveLength(0);
  });

  it('should fail when sortBy is not one of the allowed fields', async () => {
    const dto = new FindArticlesQueryDto();
    (dto as any).sortBy = 'invalidField';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'sortBy' && e.constraints?.isIn),
    ).toBe(true);
  });

  it('should pass when sortBy is a valid field', async () => {
    const dto = new FindArticlesQueryDto();
    dto.sortBy = 'createdAt';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when order is not one of Order values', async () => {
    const dto = new FindArticlesQueryDto();
    (dto as any).order = 'INVALID_ORDER';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'order' && e.constraints?.isIn),
    ).toBe(true);
  });

  it('should pass when order is a valid Order value', async () => {
    const dto = new FindArticlesQueryDto();
    dto.order = Order[1];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if tag is not a string', async () => {
    const dto = new FindArticlesQueryDto();
    (dto as any).tag = 123;

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'tag' && e.constraints?.isString),
    ).toBe(true);
  });
});
