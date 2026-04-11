import { Injectable } from '@nestjs/common';

import type { CategoryInterface } from 'src/domain/entities/category.interface';
import type {
  CategoryFilters,
  CategoryRepository,
} from 'src/domain/repositories/category.repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RealDbCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(category: CategoryInterface): Promise<CategoryInterface> {
    const created = await this.prisma.category.create({
      data: {
        name: category.name,
        description: category.description,
      },
    });

    return created;
  }

  async findById(id: string): Promise<CategoryInterface | null> {
    return (
      (await this.prisma.category.findUnique({
        where: { id },
      })) ?? null
    );
  }

  async findAll(filters: CategoryFilters): Promise<{
    total: number;
    page: number;
    limit: number;
    data: CategoryInterface[];
  }> {
    const { page, limit, sortBy, order } = filters;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order.toLowerCase() as 'asc' | 'desc',
        },
      }),
      this.prisma.category.count(),
    ]);

    return {
      total,
      page,
      limit,
      data,
    };
  }

  async update(
    id: string,
    category: CategoryInterface,
  ): Promise<CategoryInterface> {
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        name: category.name,
        description: category.description,
      },
    });

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.article.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
      await tx.category.delete({
        where: { id },
      });
    });
  }
}
