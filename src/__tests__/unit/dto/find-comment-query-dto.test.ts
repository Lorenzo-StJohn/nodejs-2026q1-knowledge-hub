import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { FindCommentQueryDto } from 'src/modules/comment/dto/find-comment-query.dto';
import { Order } from 'src/common/entities/sort.interface';

describe('FindCommentQueryDto', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000';

  it('should pass with a valid payload', async () => {
    const dto = new FindCommentQueryDto();
    dto.articleId = validUuid;
    dto.sortBy = 'content';
    dto.order = Order[1];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when sortBy and order are omitted', async () => {
    const dto = new FindCommentQueryDto();
    dto.articleId = validUuid;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if articleId is missing', async () => {
    const dto = new FindCommentQueryDto();
    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'articleId' && e.constraints?.isUuid),
    ).toBe(true);
  });

  it('should fail if articleId is not a valid UUID v4', async () => {
    const dto = new FindCommentQueryDto();
    dto.articleId = 'not-a-uuid';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'articleId' && e.constraints?.isUuid),
    ).toBe(true);
  });

  it('should fail if articleId is an empty string', async () => {
    const dto = new FindCommentQueryDto();
    dto.articleId = '';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'articleId' && e.constraints?.isUuid),
    ).toBe(true);
  });

  it('should fail if sortBy is not in CommentFields', async () => {
    const dto = new FindCommentQueryDto();
    dto.articleId = validUuid;
    (dto as any).sortBy = 'invalidField';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'sortBy' && e.constraints?.isIn),
    ).toBe(true);
  });

  it('should fail if order is not in Order', async () => {
    const dto = new FindCommentQueryDto();
    dto.articleId = validUuid;
    (dto as any).order = 'INVALID_ORDER';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'order' && e.constraints?.isIn),
    ).toBe(true);
  });

  it('should pass with only articleId and valid sortBy', async () => {
    const dto = new FindCommentQueryDto();
    dto.articleId = validUuid;
    dto.sortBy = 'createdAt';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass with only articleId and valid order', async () => {
    const dto = new FindCommentQueryDto();
    dto.articleId = validUuid;
    dto.order = Order[0];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
