import { IsUUID } from 'class-validator';

import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class FindCommentsQueryDto extends PaginationQueryDto {
  @IsUUID('4', {
    message: 'ArticleId should be valid UUID v4',
  })
  articleId: string;
}
