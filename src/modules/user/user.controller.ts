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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-user.dto';
import { IdParamDto } from 'src/common/dto/id-param.dto';
import { ConditionalPaginationInterceptor } from 'src/common/interceptors/conditional-pagination.interceptor';
import { FindUserQueryDto } from './dto/find-user-query.dto';

@Controller('user')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user', description: 'Creates a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been created',
    example: {
      id: 'b1b73593-2445-421a-af42-359114d6c536',
      login: 'string',
      role: 'admin',
      createdAt: 1775287579998,
      updatedAt: 1775287579998,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Body does not contain required fields',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Gets all users. Supports pagination and sorting',
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
                id: 'b1b73593-2445-421a-af42-359114d6c536',
                login: 'string',
                role: 'admin',
                createdAt: 1775287579998,
                updatedAt: 1775287579998,
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
                  id: 'b1b73593-2445-421a-af42-359114d6c536',
                  login: 'string',
                  role: 'admin',
                  createdAt: 1775287579998,
                  updatedAt: 1775287579998,
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
  async findAll(@Query() filters: FindUserQueryDto) {
    return await this.userService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single user by id',
    description: 'Get single user by id',
  })
  @ApiParam({
    name: 'id',
    description: 'User id, format UUID v4',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    example: {
      id: 'b1b73593-2445-421a-af42-359114d6c536',
      login: 'string',
      role: 'admin',
      createdAt: 1775287579998,
      updatedAt: 1775287579998,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. User id is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(@Param() params: IdParamDto) {
    return await this.userService.findOne(params.id);
  }

  @Put(':id')
  @ApiOperation({
    summary: "Update a user's password",
    description: "Updates a user's password by ID",
  })
  @ApiParam({
    name: 'id',
    description: 'User id, format UUID v4',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been updated',
    example: {
      id: 'b1b73593-2445-421a-af42-359114d6c536',
      login: 'string',
      role: 'admin',
      createdAt: 1775287579998,
      updatedAt: 1775288465881,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. User id is invalid (not uuid)',
  })
  @ApiResponse({
    status: 403,
    description: 'oldPassword is wrong',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async update(
    @Param() params: IdParamDto,
    @Body() updateUserDto: UpdatePasswordDto,
  ) {
    return await this.userService.update(params.id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletes user',
    description:
      "Deletes user by ID. Sets authorId to null on articles, deletes user's comments",
  })
  @ApiParam({
    name: 'id',
    description: 'User id, format UUID v4',
  })
  @ApiResponse({
    status: 204,
    description: 'The user has been deleted',
    example: '',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. User id is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Param() params: IdParamDto) {
    return await this.userService.remove(params.id);
  }
}
