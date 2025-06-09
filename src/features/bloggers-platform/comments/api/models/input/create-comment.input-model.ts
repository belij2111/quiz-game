import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { IsEnum, Length } from 'class-validator';
import { BaseSortablePaginationParams } from '../../../../../../core/models/base-query-params.input-model';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentInputModel {
  @TrimIsString()
  @Length(20, 300, {
    message: 'title length should be from 20 to 300 symbol',
  })
  @ApiProperty()
  content: string;
}

export enum CommentSortBy {
  CreatedAt = 'createdAt',
}

export class GetCommentQueryParams extends BaseSortablePaginationParams<CommentSortBy> {
  @IsEnum(CommentSortBy)
  sortBy = CommentSortBy.CreatedAt;
}
