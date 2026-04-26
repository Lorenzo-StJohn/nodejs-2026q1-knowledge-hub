import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { FindUserQueryDto } from 'src/modules/user/dto/find-user-query.dto';
import { Order } from 'src/common/entities/sort.interface';

describe('FindUserQueryDto', () => {
  it('should pass with a valid payload', async () => {
    const dto = new FindUserQueryDto();
    dto.sortBy = 'login';
    dto.order = Order[1];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when sortBy and order are omitted (undefined)', async () => {
    const dto = new FindUserQueryDto();

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass with default values (sortBy = "createdAt", order = "ASC")', async () => {
    const dto = new FindUserQueryDto();
    dto.sortBy = 'createdAt';
    dto.order = Order[0];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if sortBy is not in UserFields', async () => {
    const dto = new FindUserQueryDto();
    (dto as any).sortBy = 'invalidField';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'sortBy' && e.constraints?.isIn),
    ).toBe(true);
  });

  it('should fail if order is not in Order', async () => {
    const dto = new FindUserQueryDto();
    (dto as any).order = 'INVALID_ORDER';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'order' && e.constraints?.isIn),
    ).toBe(true);
  });

  it('should pass when only sortBy is provided and valid', async () => {
    const dto = new FindUserQueryDto();
    dto.sortBy = 'role';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when only order is provided and valid', async () => {
    const dto = new FindUserQueryDto();
    dto.order = Order[1];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if sortBy is an empty string (not in array)', async () => {
    const dto = new FindUserQueryDto();
    (dto as any).sortBy = '';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'sortBy' && e.constraints?.isIn),
    ).toBe(true);
  });
});
