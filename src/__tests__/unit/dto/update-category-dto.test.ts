import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { UpdateCategoryDto } from 'src/modules/category/dto/update-category.dto';

describe('UpdateCategoryDto', () => {
  it('should pass when all fields are omitted (empty update)', async () => {
    const dto = new UpdateCategoryDto();

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass with a valid payload', async () => {
    const dto = new UpdateCategoryDto();
    dto.name = 'Updated Name';
    dto.description = 'Updated Description';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if name is an empty string', async () => {
    const dto = new UpdateCategoryDto();
    dto.name = '';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'name' && e.constraints?.isNotEmpty),
    ).toBe(true);
  });

  it('should fail if name is not a string', async () => {
    const dto = new UpdateCategoryDto();
    (dto as any).name = 123;

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'name' && e.constraints?.isString),
    ).toBe(true);
  });

  it('should pass if name is omitted (undefined)', async () => {
    const dto = new UpdateCategoryDto();

    const errors = await validate(dto);
    expect(errors.filter((e) => e.property === 'name')).toHaveLength(0);
  });

  it('should fail if description is an empty string', async () => {
    const dto = new UpdateCategoryDto();
    dto.description = '';

    const errors = await validate(dto);
    expect(
      errors.some(
        (e) => e.property === 'description' && e.constraints?.isNotEmpty,
      ),
    ).toBe(true);
  });

  it('should fail if description is not a string', async () => {
    const dto = new UpdateCategoryDto();
    (dto as any).description = true;

    const errors = await validate(dto);
    expect(
      errors.some(
        (e) => e.property === 'description' && e.constraints?.isString,
      ),
    ).toBe(true);
  });

  it('should pass if description is omitted (undefined)', async () => {
    const dto = new UpdateCategoryDto();

    const errors = await validate(dto);
    expect(errors.filter((e) => e.property === 'description')).toHaveLength(0);
  });
});
