import { randomUUID } from 'node:crypto';

import type { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { type UserInterface, UserRole } from './user.interface';

export class User implements UserInterface {
  public readonly id: string;
  public readonly login: string;
  public password: string;
  public role: (typeof UserRole)[keyof typeof UserRole];
  public readonly createdAt: number;
  public updatedAt: number;

  constructor(createUser: CreateUserDto) {
    const timestamp = Date.now();
    this.id = randomUUID();
    this.login = createUser.login;
    this.password = createUser.password;
    this.role = createUser.role ?? UserRole.VIEWER;
    this.createdAt = timestamp;
    this.updatedAt = timestamp;
  }

  public static updatePassword(
    user: UserInterface,
    newPassword: string,
  ): UserInterface {
    const timestamp = Date.now();
    return { ...user, password: newPassword, updatedAt: timestamp };
  }
}
