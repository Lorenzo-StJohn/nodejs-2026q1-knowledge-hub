import { randomUUID } from 'node:crypto';

import type { CreateArticleDto } from 'src/modules/article/dto/create-article.dto';
import { type ArticleInterface } from './article.interface';
import type { UpdateArticleDto } from 'src/modules/article/dto/update-article.dto';
import { ArticleStatus } from '@prisma/client';

export class Article implements ArticleInterface {
  public readonly id: string;
  public title: string;
  public content: string;
  public status: ArticleStatus;
  public authorId: string | null;
  public categoryId: string | null;
  public tags: string[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(createArticle: CreateArticleDto) {
    const timestamp = new Date();
    this.id = randomUUID();
    this.title = createArticle.title;
    this.content = createArticle.content;
    this.status = createArticle.status ?? 'draft';
    this.authorId = createArticle.authorId ?? null;
    this.categoryId = createArticle.categoryId ?? null;
    this.tags = createArticle.tags ?? [];
    this.createdAt = timestamp;
    this.updatedAt = timestamp;
  }

  public static update(
    article: ArticleInterface,
    updatedInfo: UpdateArticleDto,
  ): ArticleInterface {
    const timestamp = new Date();
    return { ...article, ...updatedInfo, updatedAt: timestamp };
  }
}
