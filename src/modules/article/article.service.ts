import { Inject, Injectable } from '@nestjs/common';

import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import {
  ARTICLE_REPOSITORY,
  type ArticleFilters,
  type ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';
import { Article } from 'src/domain/entities/article.entity';
import { ArticleResponseDto } from './dto/article-response.dto';
import { plainToInstance } from 'class-transformer';
import { ArticlePaginationResponseDto } from './dto/article-pagination-response.dto';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/domain/repositories/user.repository.interface';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from 'src/domain/repositories/category.repository.interface';
import { ArticleStatus, Role } from '@prisma/client';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from 'src/common/exceptions/custom-errors';

@Injectable()
export class ArticleService {
  constructor(
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepo: ArticleRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async create(createArticleDto: CreateArticleDto) {
    const articleEntity = new Article(createArticleDto);

    if (articleEntity.authorId) {
      const author = await this.userRepo.findById(articleEntity.authorId);
      if (!author) {
        throw new ValidationError();
      }
    }

    if (articleEntity.categoryId) {
      const category = await this.categoryRepo.findById(
        articleEntity.categoryId,
      );
      if (!category) {
        throw new ValidationError();
      }
    }

    const article = await this.articleRepo.create(articleEntity);
    return plainToInstance(ArticleResponseDto, article);
  }

  async findAll(filters: ArticleFilters) {
    const articles = await this.articleRepo.findAll(filters);
    return plainToInstance(ArticlePaginationResponseDto, articles);
  }

  async findOne(id: string) {
    const article = await this.articleRepo.findById(id);
    if (!article) {
      throw new NotFoundError();
    }
    return plainToInstance(ArticleResponseDto, article);
  }

  async searchByQuery(
    query: string,
  ): Promise<{ articleId: string; score: number }[]> {
    return this.articleRepo.searchByQuery(query);
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
    currentUser: any,
  ) {
    const article = await this.articleRepo.findById(id);
    if (!article) {
      throw new NotFoundError();
    }

    if (
      currentUser.role === Role.editor &&
      article.authorId !== currentUser.id
    ) {
      throw new ForbiddenError();
    }

    const updatedArticleEntity = Article.update(article, updateArticleDto);

    const prevStatus = article.status;
    const newStatus = updatedArticleEntity.status;

    if (prevStatus !== newStatus) {
      if (
        prevStatus === ArticleStatus.draft &&
        newStatus !== ArticleStatus.published
      ) {
        throw new ValidationError();
      }
      if (
        prevStatus === ArticleStatus.published &&
        newStatus !== ArticleStatus.archived
      ) {
        throw new ValidationError();
      }
      if (prevStatus === ArticleStatus.archived) {
        throw new ValidationError();
      }
    }

    if (updatedArticleEntity.authorId) {
      const author = await this.userRepo.findById(
        updatedArticleEntity.authorId,
      );
      if (!author) {
        throw new ValidationError();
      }
    }

    if (updatedArticleEntity.categoryId) {
      const category = await this.categoryRepo.findById(
        updatedArticleEntity.categoryId,
      );
      if (!category) {
        throw new ValidationError();
      }
    }

    const updatedArticle = await this.articleRepo.update(
      id,
      updatedArticleEntity,
    );
    return plainToInstance(ArticleResponseDto, updatedArticle);
  }

  async remove(id: string, currentUser: any) {
    const article = await this.articleRepo.findById(id);
    if (!article) {
      throw new NotFoundError();
    }
    if (
      currentUser.role === Role.editor &&
      article.authorId !== currentUser.id
    ) {
      throw new ForbiddenError();
    }
    return await this.articleRepo.delete(id);
  }
}
