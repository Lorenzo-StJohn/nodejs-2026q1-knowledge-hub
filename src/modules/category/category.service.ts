import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from 'src/domain/repositories/category.repository.interface';
import { Category } from 'src/domain/entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const categoryEntity = new Category(createCategoryDto);
    return await this.categoryRepo.create(categoryEntity);
  }

  async findAll() {
    return await this.categoryRepo.findAll();
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
    return await this.categoryRepo.delete(id);
  }
}
