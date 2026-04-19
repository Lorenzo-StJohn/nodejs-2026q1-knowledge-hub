import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Put,
  UseInterceptors,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { IdParamDto } from 'src/common/dto/id-param.dto';
import { ConditionalPaginationInterceptor } from 'src/common/interceptors/conditional-pagination.interceptor';
import { FindCategoryQueryDto } from './dto/find-category-query.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('category')
@UseGuards(RolesGuard)
@ApiTags('Categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles(Role.admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add new category ',
    description: 'Adds new category ',
  })
  @ApiResponse({
    status: 201,
    description: 'Category is created',
    example: {
      id: 'f3d2f4c6-5376-48df-b4a7-9fe825559db9',
      name: 'string',
      description: 'string',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Body does not contain required fields',
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @Roles(Role.viewer, Role.editor, Role.admin)
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Gets all categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    content: {
      'application/json': {
        examples: {
          'Without pagination': {
            value: [
              {
                id: 'f3d2f4c6-5376-48df-b4a7-9fe825559db9',
                name: 'string',
                description: 'string',
              },
            ],
            description: 'Without page and limit query parameters',
          },
          'With pagination': {
            value: {
              total: 1,
              page: 1,
              limit: 10,
              data: [
                {
                  id: 'f3d2f4c6-5376-48df-b4a7-9fe825559db9',
                  name: 'string',
                  description: 'string',
                },
              ],
            },
            description: 'With page and limit query parameters',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Wrong query parameters (hacker scope)',
  })
  @UseInterceptors(ConditionalPaginationInterceptor)
  async findAll(@Query() filters: FindCategoryQueryDto) {
    return this.categoryService.findAll(filters);
  }

  @Get(':id')
  @Roles(Role.viewer, Role.editor, Role.admin)
  @ApiOperation({
    summary: 'Get single category by id',
    description: 'Get single category by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Category id, format UUID v4',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    example: {
      id: 'f3d2f4c6-5376-48df-b4a7-9fe825559db9',
      name: 'string',
      description: 'string',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Category id is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findOne(@Param() params: IdParamDto) {
    return this.categoryService.findOne(params.id);
  }

  @Put(':id')
  @Roles(Role.admin)
  @ApiOperation({
    summary: 'Update category information',
    description: 'Updates category information by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Category id, format UUID v4',
  })
  @ApiResponse({
    status: 200,
    description: 'The category has been updated',
    example: {
      id: 'f3d2f4c6-5376-48df-b4a7-9fe825559db9',
      name: 'string',
      description: 'string',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Category id is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async update(
    @Param() params: IdParamDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(params.id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(Role.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete category',
    description:
      'Deletes category. Sets categoryId to null on associated articles.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category id, format UUID v4',
  })
  @ApiResponse({
    status: 204,
    description: 'The category has been deleted',
    example: '',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Category id is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async remove(@Param() params: IdParamDto) {
    return this.categoryService.remove(params.id);
  }
}
