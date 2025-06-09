import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { IsEnum, Length } from 'class-validator';
import { BaseSortablePaginationParams } from '../../../../../../core/models/base-query-params.input-model';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostInputModel {
  @TrimIsString()
  @Length(3, 30, {
    message: 'title length should be from 3 to 30 symbol',
  })
  @ApiProperty()
  title: string;

  @TrimIsString()
  @Length(3, 100, {
    message: 'shortDescription length should be from 3 to 100 symbol',
  })
  @ApiProperty()
  shortDescription: string;

  @TrimIsString()
  @Length(3, 1000, {
    message: 'content length should be from 3 to 1000 symbol',
  })
  @ApiProperty()
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
