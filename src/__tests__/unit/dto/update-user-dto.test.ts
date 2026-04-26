import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { UpdatePasswordDto } from 'src/modules/user/dto/update-user.dto';

describe('UpdatePasswordDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new UpdatePasswordDto();
    dto.oldPassword = 'oldSecret123';
    dto.newPassword = 'newSecret456';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if oldPassword is missing', async () => {
    const dto = new UpdatePasswordDto();
    dto.newPassword = 'newSecret456';

    const errors = await validate(dto);
    const oldPwErrors = errors.filter((e) => e.property === 'oldPassword');
    expect(oldPwErrors.length).toBeGreaterThan(0);
    const constraints = oldPwErrors[0].constraints;
    expect(constraints?.isString).toBeDefined();
    expect(constraints?.isNotEmpty).toBeDefined();
  });

  it('should fail if oldPassword is empty string', async () => {
    const dto = new UpdatePasswordDto();
    dto.oldPassword = '';
    dto.newPassword = 'newSecret456';

    const errors = await validate(dto);
    expect(
      errors.some(
        (e) => e.property === 'oldPassword' && e.constraints?.isNotEmpty,
      ),
    ).toBe(true);
  });

  it('should fail if oldPassword is not a string', async () => {
    const dto = new UpdatePasswordDto();
    (dto as any).oldPassword = 12345;
    dto.newPassword = 'newSecret456';

    const errors = await validate(dto);
    expect(
      errors.some(
        (e) => e.property === 'oldPassword' && e.constraints?.isString,
      ),
    ).toBe(true);
  });

  it('should fail if newPassword is missing', async () => {
    const dto = new UpdatePasswordDto();
    dto.oldPassword = 'oldSecret123';

    const errors = await validate(dto);
    const newPwErrors = errors.filter((e) => e.property === 'newPassword');
    expect(newPwErrors.length).toBeGreaterThan(0);
    expect(newPwErrors[0].constraints?.isString).toBeDefined();
    expect(newPwErrors[0].constraints?.isNotEmpty).toBeDefined();
  });

  it('should fail if newPassword is empty string', async () => {
    const dto = new UpdatePasswordDto();
    dto.oldPassword = 'oldSecret123';
    dto.newPassword = '';

    const errors = await validate(dto);
    expect(
      errors.some(
        (e) => e.property === 'newPassword' && e.constraints?.isNotEmpty,
      ),
    ).toBe(true);
  });

  it('should fail if newPassword is not a string', async () => {
    const dto = new UpdatePasswordDto();
    dto.oldPassword = 'oldSecret123';
    (dto as any).newPassword = true;

    const errors = await validate(dto);
    expect(
      errors.some(
        (e) => e.property === 'newPassword' && e.constraints?.isString,
      ),
    ).toBe(true);
  });
});
