import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FindCommentQueryDto } from './dto/find-comment-query.dto';
import { IdParamDto } from 'src/common/dto/id-param.dto';
import { ConditionalPaginationInterceptor } from 'src/common/interceptors/conditional-pagination.interceptor';

@Controller('comment')
@ApiTags('Comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add new comment',
    description: 'Add a comment to an article',
  })
  @ApiResponse({
    status: 201,
    description: 'Comment is created',
    example: {
      id: '63d364f4-168b-416f-b9d2-865d5a579e87',
      content: 'Great article!',
      articleId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      authorId: 'b1b73593-2445-421a-af42-359114d6c536',
      createdAt: 1775287579998,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Body does not contain required fields',
  })
  async create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get comments for an article',
    description:
      'Gets all comments for a specific article. Requires articleId query parameter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    example: [
      {
        id: '63d364f4-168b-416f-b9d2-865d5a579e87',
        content: 'Great article!',
        articleId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        authorId: 'b1b73593-2445-421a-af42-359114d6c536',
        createdAt: 1775287579998,
      },
    ],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Wrong query parameters (hacker scope)',
  })
  @UseInterceptors(ConditionalPaginationInterceptor)
  async findAll(@Query() filters: FindCommentQueryDto) {
    return this.commentService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single comment by id',
    description: 'Gets single comment by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Comment id, format UUID v4',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    example: {
      id: '63d364f4-168b-416f-b9d2-865d5a579e87',
      content: 'Great article!',
      articleId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      authorId: 'b1b73593-2445-421a-af42-359114d6c536',
      createdAt: 1775287579998,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Comment id is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  async findById(@Param() params: IdParamDto) {
    return this.commentService.findOne(params.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete comment',
    description: 'Deletes comment',
  })
  @ApiParam({
    name: 'id',
    description: 'Comment id, format UUID v4',
  })
  @ApiResponse({
    status: 204,
    description: 'The comment has been deleted',
    example: '',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Comment id is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  async remove(@Param() params: IdParamDto) {
    return this.commentService.remove(params.id);
  }
}
