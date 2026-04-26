import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { ArticleStatus } from '@prisma/client';
import { UpdateArticleDto } from 'src/modules/article/dto/update-article.dto';

describe('UpdateArticleDto', () => {
  const validUuid1 = '550e8400-e29b-41d4-a716-446655440000';
  const validUuid2 = '550e8400-e29b-41d4-a716-446655440001';

  it('should pass with a full valid payload', async () => {
    const dto = new UpdateArticleDto();

    dto.title = 'Updated title';
    dto.content = 'Updated content';
    dto.status = ArticleStatus.published;
    dto.authorId = validUuid1;
    dto.categoryId = validUuid2;
    dto.tags = ['nestjs', 'testing'];

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should pass when all fields are omitted (empty update)', async () => {
    const dto = new UpdateArticleDto();

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail if title is an empty string', async () => {
    const dto = new UpdateArticleDto();
    dto.title = '';

    const errors = await validate(dto);

    expect(
      errors.some((e) => e.property === 'title' && e.constraints?.isNotEmpty),
    ).toBe(true);
  });

  it('should fail if title is not a string', async () => {
    const dto = new UpdateArticleDto();
    (dto as any).title = 123;

    const errors = await validate(dto);

    expect(
      errors.some((e) => e.property === 'title' && e.constraints?.isString),
    ).toBe(true);
  });

  it('should fail if content is an empty string', async () => {
    const dto = new UpdateArticleDto();
    dto.content = '';

    const errors = await validate(dto);

    expect(
      errors.some((e) => e.property === 'content' && e.constraints?.isNotEmpty),
    ).toBe(true);
  });

  it('should fail if content is not a string', async () => {
    const dto = new UpdateArticleDto();
    (dto as any).content = true;

    const errors = await validate(dto);

    expect(
      errors.some((e) => e.property === 'content' && e.constraints?.isString),
    ).toBe(true);
  });

  it('should fail for invalid enum status', async () => {
    const dto = new UpdateArticleDto();
    (dto as any).status = 'invalid_status';

    const errors = await validate(dto);

    expect(
      errors.some((e) => e.property === 'status' && e.constraints?.isEnum),
    ).toBe(true);
  });

  it('should pass for valid enum status', async () => {
    const dto = new UpdateArticleDto();
    dto.status = ArticleStatus.archived;

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail for invalid author UUID (not null)', async () => {
    const dto = new UpdateArticleDto();
    dto.authorId = 'bad-uuid';

    const errors = await validate(dto);

    expect(
      errors.some((e) => e.property === 'authorId' && e.constraints?.isUuid),
    ).toBe(true);
  });

  it('should pass when authorId is null', async () => {
    const dto = new UpdateArticleDto();
    dto.authorId = null;

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should pass when authorId is a valid UUID', async () => {
    const dto = new UpdateArticleDto();
    dto.authorId = validUuid1;

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail for invalid category UUID (not null)', async () => {
    const dto = new UpdateArticleDto();
    dto.categoryId = 'bad-uuid';

    const errors = await validate(dto);

    expect(
      errors.some((e) => e.property === 'categoryId' && e.constraints?.isUuid),
    ).toBe(true);
  });

  it('should pass when categoryId is null', async () => {
    const dto = new UpdateArticleDto();
    dto.categoryId = null;

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should pass when categoryId is a valid UUID', async () => {
    const dto = new UpdateArticleDto();
    dto.categoryId = validUuid2;

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail when tags is not an array', async () => {
    const dto = new UpdateArticleDto();
    (dto as any).tags = 'nestjs';

    const errors = await validate(dto);

    expect(
      errors.some((e) => e.property === 'tags' && e.constraints?.isArray),
    ).toBe(true);
  });

  it('should fail when tag contains an empty string', async () => {
    const dto = new UpdateArticleDto();
    dto.tags = ['nestjs', ''];

    const errors = await validate(dto);

    expect(
      errors.some((e) => e.property === 'tags' && e.constraints?.isNotEmpty),
    ).toBe(true);
  });

  it('should fail when tag contains a non-string value', async () => {
    const dto = new UpdateArticleDto();
    (dto as any).tags = ['nestjs', 123];

    const errors = await validate(dto);

    expect(
      errors.some((e) => e.property === 'tags' && e.constraints?.isString),
    ).toBe(true);
  });

  it('should pass when tags is a valid array of strings', async () => {
    const dto = new UpdateArticleDto();
    dto.tags = ['nestjs', 'typescript'];

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should pass when tags is omitted', async () => {
    const dto = new UpdateArticleDto();

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
