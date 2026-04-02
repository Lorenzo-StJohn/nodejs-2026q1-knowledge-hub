import { randomUUID } from 'node:crypto';

import type { CreateArticleDto } from 'src/modules/article/dto/create-article.dto';
import { type ArticleInterface, ArticleStatus } from './article.interface';
import type { UpdateArticleDto } from 'src/modules/article/dto/update-article.dto';

export class Article implements ArticleInterface {
  public readonly id: string;
  public title: string;
  public content: string;
  public status: (typeof ArticleStatus)[keyof typeof ArticleStatus];
  public authorId: string | null;
  public categoryId: string | null;
  public tags: string[];
  public createdAt: number;
  public updatedAt: number;

  constructor(createArticle: CreateArticleDto) {
    const timestamp = Date.now();
    this.id = randomUUID();
    this.title = createArticle.title;
    this.content = createArticle.content;
    this.status = createArticle.status ?? ArticleStatus.DRAFT;
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
    const timestamp = Date.now();
    return { ...article, ...updatedInfo, updatedAt: timestamp };
  }
}
