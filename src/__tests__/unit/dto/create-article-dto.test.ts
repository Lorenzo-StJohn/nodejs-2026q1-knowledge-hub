import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { ArticleStatus } from '@prisma/client';
import { CreateArticleDto } from 'src/modules/article/dto/create-article.dto';

describe('CreateArticleDto', () => {
  const validUuid1 = '550e8400-e29b-41d4-a716-446655440000';
  const validUuid2 = '550e8400-e29b-41d4-a716-446655440001';

  it('should fail when title is missing', async () => {
    const dto = new CreateArticleDto();

    dto.content = 'Article content';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);

    expect(
      errors.some((e) => e.property === 'title' && e.constraints?.isNotEmpty),
    ).toBe(true);
  });

  it('should fail when content is missing', async () => {
    const dto = new CreateArticleDto();

    dto.title = 'Article title';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);

    expect(
      errors.some((e) => e.property === 'content' && e.constraints?.isNotEmpty),
    ).toBe(true);
  });

  it('should fail for invalid enum status', async () => {
    const dto = new CreateArticleDto();

    dto.title = 'Test article';
    dto.content = 'Some content';
    (dto as any).status = 'wrong-status';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);

    expect(
      errors.some((e) => e.property === 'status' && e.constraints?.isEnum),
    ).toBe(true);
  });

  it('should fail for invalid author UUID', async () => {
    const dto = new CreateArticleDto();

    dto.title = 'Test article';
    dto.content = 'Some content';
    dto.authorId = 'bad-uuid';

    const errors = await validate(dto);

    expect(
      errors.some((e) => e.property === 'authorId' && e.constraints?.isUuid),
    ).toBe(true);
  });

  it('should fail for invalid category UUID', async () => {
    const dto = new CreateArticleDto();

    dto.title = 'Test article';
    dto.content = 'Some content';
    dto.categoryId = 'bad-uuid';

    const errors = await validate(dto);

    expect(
      errors.some((e) => e.property === 'categoryId' && e.constraints?.isUuid),
    ).toBe(true);
  });

  it('should fail when tags is not array', async () => {
    const dto = new CreateArticleDto();

    dto.title = 'Test article';
    dto.content = 'Some content';

    (dto as any).tags = 'nestjs';

    const errors = await validate(dto);

    expect(
      errors.some((e) => e.property === 'tags' && e.constraints?.isArray),
    ).toBe(true);
  });

  it('should fail when tag contains empty string', async () => {
    const dto = new CreateArticleDto();

    dto.title = 'Test article';
    dto.content = 'Some content';
    dto.tags = ['nestjs', ''];

    const errors = await validate(dto);

    expect(
      errors.some((e) => e.property === 'tags' && e.constraints?.isNotEmpty),
    ).toBe(true);
  });

  it('should pass with valid payload', async () => {
    const dto = new CreateArticleDto();

    dto.title = 'Valid title';
    dto.content = 'Valid content';
    dto.status = ArticleStatus.draft;
    dto.authorId = validUuid1;
    dto.categoryId = validUuid2;
    dto.tags = ['nestjs', 'typescript'];

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should pass when nullable ids are null', async () => {
    const dto = new CreateArticleDto();

    dto.title = 'Valid title';
    dto.content = 'Valid content';
    dto.authorId = null;
    dto.categoryId = null;

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
