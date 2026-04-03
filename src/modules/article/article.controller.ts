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
} from '@nestjs/common';

import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FindArticleParamDto } from './dto/find-article-param.dto';
import { FindArticlesQueryDto } from './dto/find-articles-query.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createArticleDto: CreateArticleDto) {
    return await this.articleService.create(createArticleDto);
  }

  @Get()
  async findAll(@Query() query: FindArticlesQueryDto) {
    return await this.articleService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param() params: FindArticleParamDto) {
    return await this.articleService.findOne(params.id);
  }

  @Put(':id')
  async update(
    @Param() params: FindArticleParamDto,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return await this.articleService.update(params.id, updateArticleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: FindArticleParamDto) {
    return await this.articleService.remove(params.id);
  }
}
