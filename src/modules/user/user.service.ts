import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  UserRepository,
  USER_REPOSITORY,
} from 'src/domain/repositories/user.repository.interface';
import { User } from 'src/domain/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userEntity = new User(createUserDto);
    const createdUser = await this.userRepo.create(userEntity);
    return plainToInstance(UserResponseDto, createdUser, {
      excludeExtraneousValues: true,
    });
  }

  async findAll() {
    const users = await this.userRepo.findAll();
    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found!`);
    }
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, updateUserDto: UpdatePasswordDto) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found!`);
    }
    const oldPassword = user.password;
    if (oldPassword !== updateUserDto.oldPassword) {
      throw new ForbiddenException('Wrong old password!');
    }
    const updatedUserEntity = User.updatePassword(
      user,
      updateUserDto.newPassword,
    );
    const updatedUser = await this.userRepo.update(id, updatedUserEntity);
    return plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found!`);
    }
    return await this.userRepo.delete(id);
  }
}
