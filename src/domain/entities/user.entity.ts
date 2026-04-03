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

  public static async updatePassword(user: UserInterface, newPassword: string) {
    //prevent creating and updating in the same time
    await new Promise((resolve) => setTimeout(resolve, 10));
    const timestamp = Date.now();
    return { ...user, password: newPassword, updatedAt: timestamp };
  }
}
