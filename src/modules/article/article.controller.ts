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
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FindArticlesQueryDto } from './dto/find-articles-query.dto';
import { IdParamDto } from 'src/common/dto/id-param.dto';
import { ConditionalPaginationInterceptor } from 'src/common/interceptors/conditional-pagination.interceptor';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ParseUUIDPipe } from 'src/common/pipes/parse-uuid.pipe';

@Controller('article')
@UseGuards(RolesGuard)
@ApiTags('Articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @Roles(Role.editor, Role.admin)
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
      authorId: null,
      categoryId: null,
      tags: ['nestjs', 'typescript', 'backend'],
      createdAt: 1775299578964,
      updatedAt: 1775299578964,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation Error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async create(@Body() createArticleDto: CreateArticleDto) {
    return await this.articleService.create(createArticleDto);
  }

  @Get()
  @Roles(Role.viewer, Role.editor, Role.admin)
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
                authorId: null,
                categoryId: null,
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
                  authorId: null,
                  categoryId: null,
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
    description: 'Validation Error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseInterceptors(ConditionalPaginationInterceptor)
  async findAll(@Query() filters: FindArticlesQueryDto) {
    return await this.articleService.findAll(filters);
  }

  @Get(':id')
  @Roles(Role.viewer, Role.editor, Role.admin)
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
      authorId: null,
      categoryId: null,
      tags: ['nestjs', 'typescript', 'backend'],
      createdAt: 1775299578964,
      updatedAt: 1775299578964,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation Error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.articleService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.editor, Role.admin)
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
      authorId: null,
      categoryId: null,
      tags: ['nestjs', 'typescript', 'backend'],
      createdAt: 1775299578964,
      updatedAt: 1775300238971,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation Error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  async update(
    @Param() params: IdParamDto,
    @Body() updateArticleDto: UpdateArticleDto,
    @CurrentUser() user: any,
  ) {
    return await this.articleService.update(params.id, updateArticleDto, user);
  }

  @Delete(':id')
  @Roles(Role.admin, Role.editor)
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
    description: 'Validation Error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  async remove(@Param() params: IdParamDto, @CurrentUser() user: any) {
    return await this.articleService.remove(params.id, user);
  }
}
