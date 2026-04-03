import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CATEGORY_REPOSITORY,
  type CategoryFilters,
  CategoryRepository,
} from 'src/domain/repositories/category.repository.interface';
import { Category } from 'src/domain/entities/category.entity';
import {
  ARTICLE_REPOSITORY,
  ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: CategoryRepository,
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepo: ArticleRepository,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const categoryEntity = new Category(createCategoryDto);
    return await this.categoryRepo.create(categoryEntity);
  }

  async findAll(filters: CategoryFilters) {
    return await this.categoryRepo.findAll(filters);
  }

  async findOne(id: string) {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found!`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found!`);
    }
    const updatedCategoryEntity = Category.update(category, updateCategoryDto);
    return await this.categoryRepo.update(id, updatedCategoryEntity);
  }

  async remove(id: string) {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found!`);
    }

    const articlesByCategory = await this.articleRepo.findByCategoryId(id);
    if (articlesByCategory) {
      articlesByCategory.forEach(async (articleId) => {
        const article = await this.articleRepo.findById(articleId);
        const updatedArticle = { ...article, categoryId: null };
        this.articleRepo.update(articleId, updatedArticle);
      });
    }

    return await this.categoryRepo.delete(id);
  }
}
