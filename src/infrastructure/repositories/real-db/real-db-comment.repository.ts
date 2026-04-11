import { Injectable } from '@nestjs/common';

import type { CommentInterface } from 'src/domain/entities/comment.interface';
import type {
  CommentFilters,
  CommentRepository,
} from 'src/domain/repositories/comment.repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';

const commentTransform = (comment: {
  id: string;
  content: string;
  article: { id: string };
  author?: null | { id: string };
  createdAt: Date;
}) => {
  return {
    id: comment.id,
    content: comment.content,
    articleId: comment.article.id,
    authorId: comment.author ? comment.author.id : null,
    createdAt: comment.createdAt,
  };
};

@Injectable()
export class RealDbCommentRepository implements CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(comment: CommentInterface): Promise<CommentInterface> {
    const created = await this.prisma.comment.create({
      data: {
        content: comment.content,
        authorId: comment.authorId || undefined,
        articleId: comment.articleId,
      },
      include: {
        author: comment.authorId
          ? { select: { id: true, login: true, role: true } }
          : false,
        article: { select: { id: true, title: true } },
      },
    });

    return commentTransform(created);
  }

  async findById(id: string): Promise<CommentInterface | null> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, login: true, role: true } },
        article: { select: { id: true, title: true } },
      },
    });
    return comment ? commentTransform(comment) : null;
  }

  async findAll(filters: CommentFilters): Promise<{
    total: number;
    page: number;
    limit: number;
    data: CommentInterface[];
  }> {
    const { articleId, page, limit, sortBy, order } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (articleId) {
      where.articleId = articleId;
    }

    const orderByClause = ['authorId'].includes(sortBy)
      ? {
          [sortBy]: {
            sort: order.toLowerCase() as 'asc' | 'desc',
            nulls: 'last',
          },
        }
      : { [sortBy]: order.toLowerCase() as 'asc' | 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderByClause,
        include: {
          author: { select: { id: true, login: true, role: true } },
          article: { select: { id: true, title: true } },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      total,
      page,
      limit,
      data: data.map((comment) => commentTransform(comment)),
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({
      where: { id },
    });
  }
}
