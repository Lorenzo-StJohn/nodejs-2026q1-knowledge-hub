import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from 'src/domain/entities/comment.entity';
import {
  COMMENT_REPOSITORY,
  CommentRepository,
} from 'src/domain/repositories/comment.repository.interface';
import {
  ARTICLE_REPOSITORY,
  ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';

@Injectable()
export class CommentService {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepo: CommentRepository,
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepo: ArticleRepository,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const articleId = createCommentDto.articleId;
    const article = await this.articleRepo.findById(articleId);
    if (!article) {
      throw new UnprocessableEntityException(
        `Article with ID ${articleId} not found!`,
      );
    }
    const commentEntity = new Comment(createCommentDto);
    return await this.commentRepo.create(commentEntity);
  }

  async findOne(id: string) {
    const comment = await this.commentRepo.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found!`);
    }
    return comment;
  }

  async findAll(articleId: string) {
    return await this.commentRepo.findAll(articleId);
  }

  async remove(id: string) {
    const comment = await this.commentRepo.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found!`);
    }
    return await this.commentRepo.delete(id);
  }
}
