import { Injectable } from '@nestjs/common';

import type { UserInterface } from 'src/domain/entities/user.interface';
import type { UserRepository } from 'src/domain/repositories/user.repository.interface';
import type { FilterInterface } from 'src/common/entities/filter.interface';

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

  async findAll(filters: FilterInterface) {
    const { page, limit } = filters;

    let users = [...this.users.values()];

    const skip = (page - 1) * limit;
    const total = users.length;

    if (skip >= total) {
      users = [];
    } else {
      users = users.slice(skip, Math.min(total, skip + limit));
    }

    return { total, page, limit, data: users };
  }

  async update(id: string, user: UserInterface) {
    this.users.set(id, user);
    return this.users.get(id);
  }

  async delete(id: string) {
    this.users.delete(id);
  }
}
