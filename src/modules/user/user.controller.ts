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

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-user.dto';
import { IdParamDto } from 'src/common/dto/id-param.dto';
import { ConditionalPaginationInterceptor } from 'src/common/interceptors/conditional-pagination.interceptor';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @UseInterceptors(ConditionalPaginationInterceptor)
  async findAll(@Query() filters: PaginationQueryDto) {
    return await this.userService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param() params: IdParamDto) {
    return await this.userService.findOne(params.id);
  }

  @Put(':id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateUserDto: UpdatePasswordDto,
  ) {
    return await this.userService.update(params.id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: IdParamDto) {
    return await this.userService.remove(params.id);
  }
}
