import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { Role } from '@prisma/client';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';

describe('CreateUserDto', () => {
  it('should pass with all fields valid', async () => {
    const dto = new CreateUserDto();
    dto.login = 'newuser';
    dto.password = 'securePassword';
    dto.role = Role.viewer;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when role is omitted (optional)', async () => {
    const dto = new CreateUserDto();
    dto.login = 'newuser';
    dto.password = 'securePassword';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if login is missing', async () => {
    const dto = new CreateUserDto();
    dto.password = 'securePassword';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const loginErrors = errors.filter((e) => e.property === 'login');
    expect(loginErrors.length).toBe(1);
    const constraints = loginErrors[0].constraints;
    expect(constraints?.isNotEmpty).toBeDefined();
    expect(constraints?.isString).toBeDefined();
  });

  it('should fail if login is empty string', async () => {
    const dto = new CreateUserDto();
    dto.login = '';
    dto.password = 'securePassword';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'login' && e.constraints?.isNotEmpty),
    ).toBe(true);
  });

  it('should fail if login is not a string', async () => {
    const dto = new CreateUserDto();
    (dto as any).login = 12345;
    dto.password = 'securePassword';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'login' && e.constraints?.isString),
    ).toBe(true);
  });

  it('should fail if password is missing', async () => {
    const dto = new CreateUserDto();
    dto.login = 'newuser';

    const errors = await validate(dto);
    const pwErrors = errors.filter((e) => e.property === 'password');
    expect(pwErrors.length).toBe(1);
    const constraints = pwErrors[0].constraints;
    expect(constraints?.isNotEmpty).toBeDefined();
    expect(constraints?.isString).toBeDefined();
  });

  it('should fail if password is empty string', async () => {
    const dto = new CreateUserDto();
    dto.login = 'newuser';
    dto.password = '';

    const errors = await validate(dto);
    expect(
      errors.some(
        (e) => e.property === 'password' && e.constraints?.isNotEmpty,
      ),
    ).toBe(true);
  });

  it('should fail if password is not a string', async () => {
    const dto = new CreateUserDto();
    dto.login = 'newuser';
    (dto as any).password = 12345;

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'password' && e.constraints?.isString),
    ).toBe(true);
  });

  it('should fail if role is an invalid enum value', async () => {
    const dto = new CreateUserDto();
    dto.login = 'newuser';
    dto.password = 'securePassword';
    (dto as any).role = 'superadmin';

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'role' && e.constraints?.isEnum),
    ).toBe(true);
  });

  it('should pass when role is any valid enum member (admin)', async () => {
    const dto = new CreateUserDto();
    dto.login = 'adminuser';
    dto.password = 'adminpass';
    dto.role = Role.admin;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
