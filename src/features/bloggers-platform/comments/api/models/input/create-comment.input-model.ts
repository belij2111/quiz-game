import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { IsEnum, Length } from 'class-validator';
import { BaseSortablePaginationParams } from '../../../../../../core/models/base-query-params.input-model';
import { ApiProperty } from '@nestjs/swagger';

const CONTENT_MIN_LENGTH = 20;
const CONTENT_MAX_LENGTH = 300;

export class CreateCommentInputModel {
  @TrimIsString()
  @Length(CONTENT_MIN_LENGTH, CONTENT_MAX_LENGTH, {
    message: 'title length should be from 20 to 300 symbol',
  })
  @ApiProperty({ minLength: CONTENT_MIN_LENGTH, maxLength: CONTENT_MAX_LENGTH })
  content: string;
}

export enum CommentSortBy {
  CreatedAt = 'createdAt',
}

export class GetCommentQueryParams extends BaseSortablePaginationParams<CommentSortBy> {
  @IsEnum(CommentSortBy)
  sortBy = CommentSortBy.CreatedAt;
}
