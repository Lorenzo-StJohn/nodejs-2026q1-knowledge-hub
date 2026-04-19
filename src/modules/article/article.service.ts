import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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
        throw new BadRequestException(
          `User with ID ${articleEntity.authorId} does not exist!`,
        );
      }
    }

    if (articleEntity.categoryId) {
      const category = await this.categoryRepo.findById(
        articleEntity.categoryId,
      );
      if (!category) {
        throw new BadRequestException(
          `Category with ID ${articleEntity.categoryId} does not exist!`,
        );
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
      throw new NotFoundException(`Article with ID ${id} not found!`);
    }
    return plainToInstance(ArticleResponseDto, article);
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    const article = await this.articleRepo.findById(id);
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found!`);
    }

    const updatedArticleEntity = Article.update(article, updateArticleDto);

    if (updatedArticleEntity.authorId) {
      const author = await this.userRepo.findById(
        updatedArticleEntity.authorId,
      );
      if (!author) {
        throw new BadRequestException(
          `User with ID ${updatedArticleEntity.authorId} does not exist!`,
        );
      }
    }

    if (updatedArticleEntity.categoryId) {
      const category = await this.categoryRepo.findById(
        updatedArticleEntity.categoryId,
      );
      if (!category) {
        throw new BadRequestException(
          `Category with ID ${updatedArticleEntity.categoryId} does not exist!`,
        );
      }
    }

    const updatedArticle = await this.articleRepo.update(
      id,
      updatedArticleEntity,
    );
    return plainToInstance(ArticleResponseDto, updatedArticle);
  }

  async remove(id: string) {
    const article = await this.articleRepo.findById(id);
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found!`);
    }
    return await this.articleRepo.delete(id);
  }
}
