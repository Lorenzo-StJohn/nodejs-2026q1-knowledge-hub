import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from 'src/domain/repositories/category.repository.interface';
import { Category } from 'src/domain/entities/category.entity';
import { CategoryFilters } from 'src/domain/repositories/category.repository.interface';
import { CategoryService } from 'src/modules/category/category.service';
import { CreateCategoryDto } from 'src/modules/category/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/modules/category/dto/update-category.dto';

vi.spyOn(Category, 'update').mockImplementation((cat, dto) => {
  return { ...cat, ...dto } as Category;
});

describe('CategoryService', () => {
  let service: CategoryService;
  let mockCategoryRepo: jest.Mocked<CategoryRepository>;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockCategoryRepo = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CATEGORY_REPOSITORY,
          useValue: mockCategoryRepo,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  describe('create', () => {
    const dto: CreateCategoryDto = {
      name: 'Tech',
      description: 'Technology articles',
    };

    it('should call repo.create with a Category entity', async () => {
      const createdCategory = { id: '1', ...dto };
      mockCategoryRepo.create.mockResolvedValue(createdCategory);

      const result = await service.create(dto);

      expect(mockCategoryRepo.create).toHaveBeenCalledWith(
        expect.any(Category),
      );
      const entityArg = mockCategoryRepo.create.mock.calls[0][0];
      expect(entityArg).toBeInstanceOf(Category);
      expect(entityArg.name).toBe(dto.name);
      expect(entityArg.description).toBe(dto.description);
      expect(result).toEqual(createdCategory);
    });
  });

  describe('findAll', () => {
    const filters: CategoryFilters = { page: 1, limit: 10 };

    it('should return result from repo.findAll', async () => {
      const result = [{ id: '1', name: 'Cat1', description: 'test-desc' }];
      mockCategoryRepo.findAll.mockResolvedValue({
        data: result,
        total: 1,
        page: 1,
        limit: 10,
      });

      const response = await service.findAll(filters);
      expect(mockCategoryRepo.findAll).toHaveBeenCalledWith(filters);
      expect(response.data).toBe(result);
    });

    it('should handle empty result', async () => {
      mockCategoryRepo.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });
      const response = await service.findAll(filters);
      expect(response.data).toEqual([]);
      expect(response.total).toEqual(0);
    });
  });

  describe('findOne', () => {
    const id = 'existing-id';

    it('should return category if found', async () => {
      const category = { id, name: 'Tech', description: 'test-desc' };
      mockCategoryRepo.findById.mockResolvedValue(category);

      const result = await service.findOne(id);
      expect(mockCategoryRepo.findById).toHaveBeenCalledWith(id);
      expect(result).toBe(category);
    });

    it('should throw NotFoundException if not found', async () => {
      mockCategoryRepo.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const id = 'cat-1';
    const updateDto: UpdateCategoryDto = { name: 'Updated' };

    it('should update category when it exists', async () => {
      const existingCategory = { id, name: 'Old', description: 'Old desc' };
      mockCategoryRepo.findById.mockResolvedValue(existingCategory);
      const updatedCategory = { ...existingCategory, ...updateDto };
      mockCategoryRepo.update.mockResolvedValue(updatedCategory);

      const result = await service.update(id, updateDto);

      expect(mockCategoryRepo.findById).toHaveBeenCalledWith(id);
      expect(Category.update).toHaveBeenCalledWith(existingCategory, updateDto);
      expect(mockCategoryRepo.update).toHaveBeenCalledWith(id, updatedCategory);
      expect(result).toBe(updatedCategory);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryRepo.findById.mockResolvedValue(null);

      await expect(service.update('bad-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCategoryRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const id = 'cat-1';

    it('should delete category when it exists', async () => {
      const category = { id, name: 'Tech', description: 'test-desc' };
      mockCategoryRepo.findById.mockResolvedValue(category);
      mockCategoryRepo.delete.mockResolvedValue(undefined);

      await expect(service.remove(id)).resolves.toBeUndefined();
      expect(mockCategoryRepo.findById).toHaveBeenCalledWith(id);
      expect(mockCategoryRepo.delete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryRepo.findById.mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
      expect(mockCategoryRepo.delete).not.toHaveBeenCalled();
    });
  });
});
