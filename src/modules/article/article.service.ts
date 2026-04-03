import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import {
  ARTICLE_REPOSITORY,
  ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';
import { Article } from 'src/domain/entities/article.entity';
import {
  COMMENT_REPOSITORY,
  CommentRepository,
} from 'src/domain/repositories/comment.repository.interface';
import { FindArticlesQueryDto } from './dto/find-articles-query.dto';

@Injectable()
export class ArticleService {
  constructor(
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepo: ArticleRepository,
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepo: CommentRepository,
  ) {}

  async create(createArticleDto: CreateArticleDto) {
    const articleEntity = new Article(createArticleDto);
    return await this.articleRepo.create(articleEntity);
  }

  async findAll(query: FindArticlesQueryDto) {
    const articles = await this.articleRepo.findAll(query);
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

    const commentsByArticle = await this.commentRepo.findAll(id);
    if (commentsByArticle) {
      commentsByArticle.forEach(async (comment) => {
        await this.commentRepo.delete(comment.id);
      });
    }

    return await this.articleRepo.delete(id);
  }
}
