import { Injectable } from '@nestjs/common';

import type { UserInterface } from 'src/domain/entities/user.interface';
import type {
  UserFilters,
  UserRepository,
} from 'src/domain/repositories/user.repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RealDbUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: UserInterface): Promise<UserInterface> {
    const created = await this.prisma.user.create({
      data: {
        login: user.login,
        password: user.password,
        role: user.role,
      },
    });
    return created;
  }

  async findById(id: string): Promise<UserInterface | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findAll(filters: UserFilters): Promise<{
    total: number;
    page: number;
    limit: number;
    data: UserInterface[];
  }> {
    const { page, limit, sortBy, order } = filters;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order.toLowerCase() as 'asc' | 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      total,
      page,
      limit,
      data,
    };
  }

  async update(id: string, user: UserInterface): Promise<UserInterface> {
    return this.prisma.user.update({
      where: { id },
      data: {
        password: user.password,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.comment.deleteMany({
        where: { authorId: id },
      });
      await tx.article.updateMany({
        where: { authorId: id },
        data: { authorId: null },
      });
      await tx.user.delete({
        where: { id },
      });
    });
  }
}
