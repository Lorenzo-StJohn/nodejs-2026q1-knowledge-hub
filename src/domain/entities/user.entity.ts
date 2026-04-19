import { randomUUID } from 'node:crypto';

import type { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { type UserInterface } from './user.interface';
import { Role } from '@prisma/client';

export class User implements UserInterface {
  public readonly id: string;
  public readonly login: string;
  public password: string;
  public role: Role;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(createUser: CreateUserDto) {
    const timestamp = new Date();
    this.id = randomUUID();
    this.login = createUser.login;
    this.password = createUser.password;
    this.role = createUser.role ?? 'viewer';
    this.createdAt = timestamp;
    this.updatedAt = timestamp;
  }

  public static async updatePassword(user: UserInterface, newPassword: string) {
    //prevent creating and updating in the same time
    await new Promise((resolve) => setTimeout(resolve, 10));
    const timestamp = new Date();
    return { ...user, password: newPassword, updatedAt: timestamp };
  }
}
