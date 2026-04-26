import { Inject, Injectable } from '@nestjs/common';

import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from 'src/domain/entities/comment.entity';
import {
  COMMENT_REPOSITORY,
  type CommentFilters,
  CommentRepository,
} from 'src/domain/repositories/comment.repository.interface';
import {
  ARTICLE_REPOSITORY,
  ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';
import { plainToInstance } from 'class-transformer';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CommentPaginationResponseDto } from './dto/comment-pagination-response.dto';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/domain/repositories/user.repository.interface';
import { Role } from '@prisma/client';
import {
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
  ValidationError,
} from 'src/common/exceptions/custom-errors';

@Injectable()
export class CommentService {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepo: CommentRepository,
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepo: ArticleRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const articleId = createCommentDto.articleId;
    const article = await this.articleRepo.findById(articleId);
    if (!article) {
      throw new UnprocessableEntityError();
    }

    const commentEntity = new Comment(createCommentDto);

    if (commentEntity.authorId) {
      const author = await this.userRepo.findById(commentEntity.authorId);
      if (!author) {
        throw new ValidationError();
      }
    }

    const comment = await this.commentRepo.create(commentEntity);
    return plainToInstance(CommentResponseDto, comment);
  }

  async findOne(id: string) {
    const comment = await this.commentRepo.findById(id);
    if (!comment) {
      throw new NotFoundError();
    }
    return plainToInstance(CommentResponseDto, comment);
  }

  async findAll(filters: CommentFilters) {
    const comments = await this.commentRepo.findAll(filters);
    return plainToInstance(CommentPaginationResponseDto, comments);
  }

  async remove(id: string, currentUser: any) {
    const comment = await this.commentRepo.findById(id);
    if (!comment) {
      throw new NotFoundError();
    }
    if (
      currentUser.role === Role.editor &&
      comment.authorId !== currentUser.id
    ) {
      throw new ForbiddenError();
    }
    return await this.commentRepo.delete(id);
  }
}
