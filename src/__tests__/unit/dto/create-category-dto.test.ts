import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { CreateCategoryDto } from 'src/modules/category/dto/create-category.dto';

describe('CreateCategoryDto', () => {
  it('should pass with a valid payload', async () => {
    const dto = new CreateCategoryDto();
    dto.name = 'Technology';
    dto.description = 'All about tech';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if name is missing', async () => {
    const dto = new CreateCategoryDto();
    dto.description = 'Some description';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'name' && e.constraints?.isNotEmpty),
    ).toBe(true);
  });

  it('should fail if name is empty string', async () => {
    const dto = new CreateCategoryDto();
    dto.name = '';
    dto.description = 'Some description';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'name' && e.constraints?.isNotEmpty),
    ).toBe(true);
  });

  it('should fail if name is not a string (e.g., number)', async () => {
    const dto = new CreateCategoryDto();
    (dto as any).name = 123;
    dto.description = 'Some description';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'name' && e.constraints?.isString),
    ).toBe(true);
  });

  it('should fail if description is missing', async () => {
    const dto = new CreateCategoryDto();
    dto.name = 'Valid Name';

    const errors = await validate(dto);
    expect(
      errors.some(
        (e) => e.property === 'description' && e.constraints?.isNotEmpty,
      ),
    ).toBe(true);
  });

  it('should fail if description is empty string', async () => {
    const dto = new CreateCategoryDto();
    dto.name = 'Valid Name';
    dto.description = '';

    const errors = await validate(dto);
    expect(
      errors.some(
        (e) => e.property === 'description' && e.constraints?.isNotEmpty,
      ),
    ).toBe(true);
  });

  it('should fail if description is not a string', async () => {
    const dto = new CreateCategoryDto();
    dto.name = 'Valid Name';
    (dto as any).description = true;

    const errors = await validate(dto);
    expect(
      errors.some(
        (e) => e.property === 'description' && e.constraints?.isString,
      ),
    ).toBe(true);
  });
});
