import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { IsEnum, Length } from 'class-validator';
import { BaseSortablePaginationParams } from '../../../../../../core/models/base-query-params.input-model';
import { ApiProperty } from '@nestjs/swagger';

const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 30;

const SHORT_DESCRIPTION_MIN_LENGTH = 3;
const SHORT_DESCRIPTION_MAX_LENGTH = 100;

const CONTENT_MIN_LENGTH = 3;
const CONTENT_MAX_LENGTH = 1000;

export class CreatePostInputModel {
  @TrimIsString()
  @Length(TITLE_MIN_LENGTH, TITLE_MAX_LENGTH, {
    message: 'title length should be from 3 to 30 symbol',
  })
  @ApiProperty({ minLength: TITLE_MIN_LENGTH, maxLength: TITLE_MAX_LENGTH })
  title: string;

  @TrimIsString()
  @Length(SHORT_DESCRIPTION_MIN_LENGTH, SHORT_DESCRIPTION_MAX_LENGTH, {
    message: 'shortDescription length should be from 3 to 100 symbol',
  })
  @ApiProperty({
    minLength: SHORT_DESCRIPTION_MIN_LENGTH,
    maxLength: SHORT_DESCRIPTION_MAX_LENGTH,
  })
  shortDescription: string;

  @TrimIsString()
  @Length(CONTENT_MIN_LENGTH, CONTENT_MAX_LENGTH, {
    message: 'content length should be from 3 to 1000 symbol',
  })
  @ApiProperty({ minLength: CONTENT_MIN_LENGTH, maxLength: CONTENT_MAX_LENGTH })
  content: string;
}

export enum PostSortBy {
  Title = 'title',
  ShortDescription = 'shortDescription',
  BlogId = 'blogId',
  BlogName = 'blogName',
  CreatedAt = 'createdAt',
}

export class GetPostQueryParams extends BaseSortablePaginationParams<PostSortBy> {
  @IsEnum(PostSortBy)
  sortBy = PostSortBy.CreatedAt;
}
