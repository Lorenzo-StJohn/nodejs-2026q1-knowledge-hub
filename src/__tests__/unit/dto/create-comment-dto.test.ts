import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { CreateCommentDto } from 'src/modules/comment/dto/create-comment.dto';

describe('CreateCommentDto', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000';
  const anotherValidUuid = '550e8400-e29b-41d4-a716-446655440001';

  it('should pass with a full valid payload', async () => {
    const dto = new CreateCommentDto();
    dto.content = 'Great article!';
    dto.articleId = validUuid;
    dto.authorId = anotherValidUuid;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when authorId is null', async () => {
    const dto = new CreateCommentDto();
    dto.content = 'Great article!';
    dto.articleId = validUuid;
    dto.authorId = null;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when authorId is omitted (undefined)', async () => {
    const dto = new CreateCommentDto();
    dto.content = 'Great article!';
    dto.articleId = validUuid;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if content is missing', async () => {
    const dto = new CreateCommentDto();
    dto.articleId = validUuid;

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'content' && e.constraints?.isNotEmpty),
    ).toBe(true);
  });

  it('should fail if content is an empty string', async () => {
    const dto = new CreateCommentDto();
    dto.content = '';
    dto.articleId = validUuid;

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'content' && e.constraints?.isNotEmpty),
    ).toBe(true);
  });

  it('should fail if content is not a string', async () => {
    const dto = new CreateCommentDto();
    (dto as any).content = 123;
    dto.articleId = validUuid;

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'content' && e.constraints?.isString),
    ).toBe(true);
  });

  it('should fail if articleId is missing', async () => {
    const dto = new CreateCommentDto();
    dto.content = 'Some content';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'articleId' && e.constraints?.isUuid),
    ).toBe(true);
  });

  it('should fail if articleId is not a valid UUID v4', async () => {
    const dto = new CreateCommentDto();
    dto.content = 'Some content';
    dto.articleId = 'not-a-uuid';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'articleId' && e.constraints?.isUuid),
    ).toBe(true);
  });

  it('should fail if authorId is provided but not a valid UUID v4 (and not null)', async () => {
    const dto = new CreateCommentDto();
    dto.content = 'Some content';
    dto.articleId = validUuid;
    dto.authorId = 'bad-uuid';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'authorId' && e.constraints?.isUuid),
    ).toBe(true);
  });

  it('should pass if authorId is a valid UUID v4', async () => {
    const dto = new CreateCommentDto();
    dto.content = 'Some content';
    dto.articleId = validUuid;
    dto.authorId = anotherValidUuid;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
