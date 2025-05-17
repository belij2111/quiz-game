import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { IsEnum, Length } from 'class-validator';
import { BaseSortablePaginationParams } from '../../../../../../core/models/base-query-params.input-model';

export class CommentCreateModel {
  @TrimIsString()
  @Length(20, 300, {
    message: 'title length should be from 20 to 300 symbol',
  })
  content: string;
}

export enum CommentSortBy {
  CreatedAt = 'createdAt',
}

export class GetCommentQueryParams extends BaseSortablePaginationParams<CommentSortBy> {
  @IsEnum(CommentSortBy)
  sortBy = CommentSortBy.CreatedAt;
}
