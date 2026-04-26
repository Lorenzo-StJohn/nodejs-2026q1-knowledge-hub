import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { SignupDto } from 'src/auth/dto/signup.dto';

describe('SignupDto', () => {
  it('should fail when login is missing', async () => {
    const dto = new SignupDto();
    dto.password = 'secret123';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);

    const loginError = errors.find((e) => e.property === 'login');

    expect(loginError).toBeDefined();
    expect(loginError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when password is missing', async () => {
    const dto = new SignupDto();
    dto.login = 'user1';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);

    const passwordError = errors.find((e) => e.property === 'password');

    expect(passwordError).toBeDefined();
    expect(passwordError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when login is not a string', async () => {
    const dto = new SignupDto();

    (dto as any).login = 123;
    dto.password = 'secret123';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);

    const loginError = errors.find((e) => e.property === 'login');

    expect(loginError?.constraints).toHaveProperty('isString');
  });

  it('should fail when password is not a string', async () => {
    const dto = new SignupDto();

    dto.login = 'user1';
    (dto as any).password = 12345;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);

    const passwordError = errors.find((e) => e.property === 'password');

    expect(passwordError?.constraints).toHaveProperty('isString');
  });

  it('should fail when fields are empty strings', async () => {
    const dto = new SignupDto();

    dto.login = '';
    dto.password = '';

    const errors = await validate(dto);

    expect(errors.length).toBe(2);
  });

  it('should pass with valid payload', async () => {
    const dto = new SignupDto();

    dto.login = 'testuser';
    dto.password = 'StrongPass123';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
