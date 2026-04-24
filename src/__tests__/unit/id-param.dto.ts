import { validate } from 'class-validator';
import { IdParamDto } from 'src/common/dto/id-param.dto';
import { describe, it, expect } from 'vitest';

describe('IdParamDto', () => {
  it('should pass with a valid UUID v4', async () => {
    const dto = new IdParamDto();
    dto.id = 'a34b1e7c-b589-443c-a55e-3b916e1dfd3f';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail with an invalid UUID string', async () => {
    const dto = new IdParamDto();
    dto.id = 'not-a-uuid';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('id');
    expect(errors[0].constraints?.isUuid).toBeDefined();
    expect(errors[0].constraints?.isUuid).toBe('ID should be valid UUID v4');
  });

  it('should fail with UUID of wrong version (e.g., v1)', async () => {
    const dto = new IdParamDto();
    dto.id = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when id is missing', async () => {
    const dto = new IdParamDto();

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when id is not a string', async () => {
    const dto = new IdParamDto();
    (dto as any).id = 12345;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isUuid');
  });
});
