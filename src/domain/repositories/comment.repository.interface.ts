import { FilterInterface } from 'src/common/entities/filter.interface';
import type { CommentInterface } from '../entities/comment.interface';
import type { PaginatedResponse } from 'src/common/entities/paginated-response.interface';
import type { CommentFields } from 'src/modules/comment/dto/find-comment-query.dto';
import { SortInterface } from 'src/common/entities/sort.interface';

export interface CommentFilters
  extends FilterInterface,
    SortInterface<typeof CommentFields> {
  articleId: string;
}

export interface CommentRepository {
  findAll(
    filters: CommentFilters,
  ): Promise<PaginatedResponse<CommentInterface>>;
  findById(id: string): Promise<CommentInterface | null>;
  findByAuthorId?(id: string): Promise<Set<string> | null>;
  create(user: CommentInterface): Promise<CommentInterface>;
  delete(id: string): Promise<void>;
}

export const COMMENT_REPOSITORY = ' COMMENT_REPOSITORY' as const;
