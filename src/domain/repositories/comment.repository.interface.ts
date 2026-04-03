import type { CommentInterface } from '../entities/comment.interface';
import type { PaginatedResponse } from 'src/common/entities/paginated-response.interface';
import type { FindCommentsQueryDto } from 'src/modules/comment/dto/find-comments-query.dto';

export interface CommentRepository {
  findAll(
    filters: FindCommentsQueryDto,
  ): Promise<PaginatedResponse<CommentInterface>>;
  findById(id: string): Promise<CommentInterface | null>;
  findByAuthorId(id: string): Promise<Set<string> | null>;
  create(user: CommentInterface): Promise<CommentInterface>;
  delete(id: string): Promise<void>;
}

export const COMMENT_REPOSITORY = ' COMMENT_REPOSITORY' as const;
