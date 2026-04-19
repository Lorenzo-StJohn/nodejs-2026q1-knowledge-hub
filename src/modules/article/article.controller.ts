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
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FindArticlesQueryDto } from './dto/find-articles-query.dto';
import { IdParamDto } from 'src/common/dto/id-param.dto';
import { ConditionalPaginationInterceptor } from 'src/common/interceptors/conditional-pagination.interceptor';

@Controller('article')
@ApiTags('Articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create article',
    description: 'Creates a new article',
  })
  @ApiResponse({
    status: 201,
    description: 'The article has been created',
    example: {
      id: '0e2f864e-8611-4e41-9d49-1c94b1df5c95',
      title: 'string',
      content: 'string',
      status: 'draft',
      authorId: 'b1b73593-2445-421a-af42-359114d6c536',
      categoryId: 'f3d2f4c6-5376-48df-b4a7-9fe825559db9',
      tags: ['nestjs', 'typescript', 'backend'],
      createdAt: 1775299578964,
      updatedAt: 1775299578964,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Body does not contain required fields',
  })
  async create(@Body() createArticleDto: CreateArticleDto) {
    return await this.articleService.create(createArticleDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all articles',
    description:
      'Gets all articles. Supports filtering by status, categoryId, and tag, pagination and sorting',
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
                id: '0e2f864e-8611-4e41-9d49-1c94b1df5c95',
                title: 'string',
                content: 'string',
                status: 'draft',
                authorId: 'b1b73593-2445-421a-af42-359114d6c536',
                categoryId: 'f3d2f4c6-5376-48df-b4a7-9fe825559db9',
                tags: ['nestjs', 'typescript', 'backend'],
                createdAt: 1775299578964,
                updatedAt: 1775299578964,
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
                  id: '0e2f864e-8611-4e41-9d49-1c94b1df5c95',
                  title: 'string',
                  content: 'string',
                  status: 'draft',
                  authorId: 'b1b73593-2445-421a-af42-359114d6c536',
                  categoryId: 'f3d2f4c6-5376-48df-b4a7-9fe825559db9',
                  tags: ['nestjs', 'typescript', 'backend'],
                  createdAt: 1775299578964,
                  updatedAt: 1775299578964,
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
  async findAll(@Query() filters: FindArticlesQueryDto) {
    return await this.articleService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single article by id',
    description: 'Get single article by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Article id, format UUID v4',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    example: {
      id: '0e2f864e-8611-4e41-9d49-1c94b1df5c95',
      title: 'string',
      content: 'string',
      status: 'draft',
      authorId: 'b1b73593-2445-421a-af42-359114d6c536',
      categoryId: 'f3d2f4c6-5376-48df-b4a7-9fe825559db9',
      tags: ['nestjs', 'typescript', 'backend'],
      createdAt: 1775299578964,
      updatedAt: 1775299578964,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Article id is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  async findOne(@Param() params: IdParamDto) {
    return await this.articleService.findOne(params.id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update article information',
    description: 'Updates article by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Article id, format UUID v4',
  })
  @ApiResponse({
    status: 200,
    description: 'The article has been updated',
    example: {
      id: '0e2f864e-8611-4e41-9d49-1c94b1df5c95',
      title: 'string',
      content: 'string',
      status: 'draft',
      authorId: 'b1b73593-2445-421a-af42-359114d6c536',
      categoryId: 'f3d2f4c6-5376-48df-b4a7-9fe825559db9',
      tags: ['nestjs', 'typescript', 'backend'],
      createdAt: 1775299578964,
      updatedAt: 1775300238971,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Article id is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  async update(
    @Param() params: IdParamDto,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return await this.articleService.update(params.id, updateArticleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletes article',
    description: 'Deletes article. Deletes all associated comments.',
  })
  @ApiParam({
    name: 'id',
    description: 'Article id, format UUID v4',
  })
  @ApiResponse({
    status: 204,
    description: 'The article has been deleted',
    example: '',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Article id is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  async remove(@Param() params: IdParamDto) {
    return await this.articleService.remove(params.id);
  }
}
