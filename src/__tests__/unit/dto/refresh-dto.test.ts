import { validate } from 'class-validator';
import { RefreshDto } from 'src/auth/dto/refresh.dto';
import { describe, it, expect } from 'vitest';

describe('RefreshDto', () => {
  it('should pass when refreshToken is provided and is a string (valid payload)', async () => {
    const dto = new RefreshDto();
    dto.refreshToken = 'some-valid-jwt-token';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass when refreshToken is missing (optional field)', async () => {
    const dto = new RefreshDto();

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail when refreshToken is not a string (invalid type)', async () => {
    const dto = new RefreshDto();
    (dto as any).refreshToken = 12345;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('refreshToken');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should pass when refreshToken is null (class-validator optional behavior)', async () => {
    const dto = new RefreshDto();
    dto.refreshToken = undefined;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
