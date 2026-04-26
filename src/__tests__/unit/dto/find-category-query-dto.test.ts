import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { FindCategoryQueryDto } from 'src/modules/category/dto/find-category-query.dto';
import { Order } from 'src/common/entities/sort.interface';

describe('FindCategoryQueryDto', () => {
  it('should pass with a valid payload', async () => {
    const dto = new FindCategoryQueryDto();
    dto.sortBy = 'name';
    dto.order = Order[1];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when both sortBy and order are omitted (undefined)', async () => {
    const dto = new FindCategoryQueryDto();

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass with default values (sortBy = "id", order = "ASC")', async () => {
    const dto = new FindCategoryQueryDto();
    dto.sortBy = 'id';
    dto.order = Order[0];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if sortBy is not in CategoryFields', async () => {
    const dto = new FindCategoryQueryDto();
    (dto as any).sortBy = 'invalidField';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'sortBy' && e.constraints?.isIn),
    ).toBe(true);
  });

  it('should fail if order is not in Order', async () => {
    const dto = new FindCategoryQueryDto();
    (dto as any).order = 'INVALID_ORDER';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'order' && e.constraints?.isIn),
    ).toBe(true);
  });

  it('should pass when only sortBy is provided and valid', async () => {
    const dto = new FindCategoryQueryDto();
    dto.sortBy = 'description';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when only order is provided and valid', async () => {
    const dto = new FindCategoryQueryDto();
    dto.order = Order[1];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
