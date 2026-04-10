import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import {
  ARTICLE_REPOSITORY,
  type ArticleFilters,
  type ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';
import { Article } from 'src/domain/entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepo: ArticleRepository,
  ) {}

  async create(createArticleDto: CreateArticleDto) {
    const articleEntity = new Article(createArticleDto);
    return await this.articleRepo.create(articleEntity);
  }

  async findAll(filters: ArticleFilters) {
    const articles = await this.articleRepo.findAll(filters);
    return articles;
  }

  async findOne(id: string) {
    const article = await this.articleRepo.findById(id);
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found!`);
    }
    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    const article = await this.articleRepo.findById(id);
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found!`);
    }
    const updatedArticleEntity = Article.update(article, updateArticleDto);
    return await this.articleRepo.update(id, updatedArticleEntity);
  }

  async remove(id: string) {
    const article = await this.articleRepo.findById(id);
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found!`);
    }
    return await this.articleRepo.delete(id);
  }
}
