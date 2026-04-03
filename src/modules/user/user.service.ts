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
import {
  ARTICLE_REPOSITORY,
  ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';
import {
  COMMENT_REPOSITORY,
  CommentRepository,
} from 'src/domain/repositories/comment.repository.interface';
import { User } from 'src/domain/entities/user.entity';
import type { FilterInterface } from 'src/common/entities/filter.interface';
import { UserPaginationResponseDto } from './dto/user-pagination-response.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepo: ArticleRepository,
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepo: CommentRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userEntity = new User(createUserDto);
    const createdUser = await this.userRepo.create(userEntity);
    return plainToInstance(UserResponseDto, createdUser, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(filters: FilterInterface) {
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
    const oldPassword = user.password;
    if (oldPassword !== updateUserDto.oldPassword) {
      throw new ForbiddenException('Wrong old password!');
    }
    const updatedUserEntity = await User.updatePassword(
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
    await this.userRepo.delete(id);

    const articlesByUser = await this.articleRepo.findByAuthorId(id);
    if (articlesByUser) {
      articlesByUser.forEach(async (articleId) => {
        const article = await this.articleRepo.findById(articleId);
        const updatedArticle = { ...article, authorId: null };
        await this.articleRepo.update(articleId, updatedArticle);
      });
    }

    const commentsByUser = await this.commentRepo.findByAuthorId(id);
    if (commentsByUser) {
      commentsByUser.forEach(async (commentId) => {
        await this.commentRepo.delete(commentId);
      });
    }
  }
}
