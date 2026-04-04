import { Injectable } from '@nestjs/common';

import type { UserInterface } from 'src/domain/entities/user.interface';
import type {
  UserFilters,
  UserRepository,
} from 'src/domain/repositories/user.repository.interface';
import { Order } from 'src/common/entities/sort.interface';

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

  async findAll(filters: UserFilters) {
    const { page, limit, sortBy, order } = filters;

    let users = [...this.users.values()];

    const skip = (page - 1) * limit;
    const total = users.length;

    if (skip >= total) {
      users = [];
    } else {
      users = users.slice(skip, Math.min(total, skip + limit));
    }

    if (sortBy) {
      users = users.sort((a, b) => {
        if (a[sortBy] === null) return 1;
        if (b[sortBy] === null) return -1;
        return order === Order[0]
          ? typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number'
            ? a[sortBy] - b[sortBy]
            : a[sortBy].localeCompare(b[sortBy])
          : typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number'
            ? b[sortBy] - a[sortBy]
            : b[sortBy].localeCompare(a[sortBy]);
      });
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
