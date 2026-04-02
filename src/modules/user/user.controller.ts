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
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-user.dto';
import { FindUserParamDto } from './dto/find-user-param.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param() params: FindUserParamDto) {
    return await this.userService.findOne(params.id);
  }

  @Put(':id')
  async update(
    @Param() params: FindUserParamDto,
    @Body() updateUserDto: UpdatePasswordDto,
  ) {
    return await this.userService.update(params.id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: FindUserParamDto) {
    return await this.userService.remove(params.id);
  }
}
