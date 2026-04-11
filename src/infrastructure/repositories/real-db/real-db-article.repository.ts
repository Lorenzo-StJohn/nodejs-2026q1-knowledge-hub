import { Injectable } from '@nestjs/common';
import { ArticleStatus, Prisma } from '@prisma/client';

import type { ArticleInterface } from 'src/domain/entities/article.interface';
import type {
  ArticleFilters,
  ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';

const articleTransform = (article: {
  id: string;
  title: string;
  content: string;
  status: ArticleStatus;
  authorId: string | null;
  categoryId: string | null;
  tags: { name: string }[];
  createdAt: Date;
  updatedAt: Date;
}) => {
  return {
    id: article.id,
    title: article.title,
    content: article.content,
    status: article.status,
    authorId: article.authorId,
    categoryId: article.categoryId,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    tags: article.tags.map((tag) => tag.name),
  };
};

@Injectable()
export class RealDbArticleRepository implements ArticleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(article: ArticleInterface): Promise<ArticleInterface> {
    const created = await this.prisma.article.create({
      data: {
        title: article.title,
        content: article.content,
        status: article.status,
        authorId: article.authorId,
        categoryId: article.categoryId,
        tags: {
          connectOrCreate: article.tags.map((tagName) => ({
            where: { name: tagName },
            create: { name: tagName },
          })),
        },
      },
      include: {
        tags: true,
        author: { select: { id: true, login: true, role: true } },
        category: true,
      },
    });
    return articleTransform(created);
  }

  async findById(id: string): Promise<ArticleInterface | null> {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        tags: true,
        author: { select: { id: true, login: true, role: true } },
        category: true,
      },
    });

    return article ? articleTransform(article) : null;
  }

  async findAll(filters: ArticleFilters): Promise<{
    total: number;
    page: number;
    limit: number;
    data: ArticleInterface[];
  }> {
    const { status, tag, categoryId, page, limit, sortBy, order } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ArticleWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tag) {
      where.tags = {
        some: { name: tag },
      };
    }

    const orderByClause = ['authorId', 'categoryId'].includes(sortBy)
      ? {
          [sortBy]: {
            sort: order.toLowerCase() as 'asc' | 'desc',
            nulls: 'last',
          },
        }
      : { [sortBy]: order.toLowerCase() as 'asc' | 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderByClause,
        include: {
          tags: true,
          author: { select: { id: true, login: true, role: true } },
          category: true,
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      total,
      page,
      limit,
      data: data.map((article) => articleTransform(article)),
    };
  }

  async update(
    id: string,
    article: ArticleInterface,
  ): Promise<ArticleInterface> {
    const updated = await this.prisma.$transaction(async (tx) => {
      return tx.article.update({
        where: { id },
        data: {
          title: article.title,
          content: article.content,
          status: article.status,
          authorId: article.authorId,
          categoryId: article.categoryId,
          tags: {
            set: [],
            connectOrCreate: article.tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          },
        },
        include: {
          tags: true,
          author: { select: { id: true, login: true, role: true } },
          category: true,
        },
      });
    });

    return articleTransform(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.comment.deleteMany({
        where: { articleId: id },
      });
      await tx.article.delete({
        where: { id },
      });
    });
  }
}
