import { Inject, Injectable, NotFoundException } from '@nestjs/common';

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

@Injectable()
export class ArticleService {
  constructor(
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepo: ArticleRepository,
  ) {}

  async create(createArticleDto: CreateArticleDto) {
    const articleEntity = new Article(createArticleDto);
    const article = await this.articleRepo.create(articleEntity);
    return plainToInstance(ArticleResponseDto, article);
  }

  async findAll(filters: ArticleFilters) {
    const articles = await this.articleRepo.findAll(filters);
    return plainToInstance(ArticleResponseDto, articles);
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
