import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { hash, compare } from 'bcryptjs';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  UserRepository,
  USER_REPOSITORY,
  type UserFilters,
} from 'src/domain/repositories/user.repository.interface';
import { User } from 'src/domain/entities/user.entity';
import { UserPaginationResponseDto } from './dto/user-pagination-response.dto';

const CRYPT_SALT = process.env.CRYPT_SALT;

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await hash(createUserDto.password, CRYPT_SALT);
    const userEntity = new User({ ...createUserDto, password: hashedPassword });
    const createdUser = await this.userRepo.create(userEntity);
    return plainToInstance(UserResponseDto, createdUser, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(filters: UserFilters) {
    const users = await this.userRepo.findAll(filters);
    return plainToInstance(UserPaginationResponseDto, users, {
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

    const isPasswordValid = await compare(
      updateUserDto.oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ForbiddenException('Wrong old password!');
    }
    const hashedNewPassword = await hash(updateUserDto.newPassword, CRYPT_SALT);

    const updatedUserEntity = await User.updatePassword(
      user,
      hashedNewPassword,
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
    await this.userRepo.delete(id);
  }
}
