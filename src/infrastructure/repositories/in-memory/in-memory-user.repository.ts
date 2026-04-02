import { Injectable } from '@nestjs/common';

import type { UserInterface } from 'src/domain/entities/user.interface';
import type { UserRepository } from 'src/domain/repositories/user.repository.interface';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, UserInterface>();

  async create(user: UserInterface) {
    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string) {
    return this.users.get(id) ?? null;
  }

  async findAll() {
    return [...this.users.values()];
  }

  async update(id: string, user: UserInterface) {
    this.users.set(id, user);
    return this.users.get(id);
  }

  async delete(id: string) {
    this.users.delete(id);
  }
}
