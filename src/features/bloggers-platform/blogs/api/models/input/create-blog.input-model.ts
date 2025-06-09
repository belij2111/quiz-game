import { IsEnum, IsOptional, IsUrl, Length, Matches } from 'class-validator';
import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { BaseSortablePaginationParams } from '../../../../../../core/models/base-query-params.input-model';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogInputModel {
  @TrimIsString()
  @Length(3, 15, {
    message: 'name length should be from 3 to 15 symbol',
  })
  @ApiProperty()
  name: string;

  @TrimIsString()
  @Length(3, 500, {
    message: 'description length should be from 3 to 500 symbol',
  })
  @ApiProperty()
  description: string;

  @TrimIsString()
  @Length(3, 100, {
    message: 'websiteUrl length should be from 3 to 100 symbol',
  })
  @IsUrl()
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
    { message: 'websiteUrl has invalid format' },
  )
  @ApiProperty()
  websiteUrl: string;
}

export enum BlogsSortBy {
  Name = 'name',
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
  CreatedAt = 'createdAt',
}

export class GetBlogsQueryParams extends BaseSortablePaginationParams<BlogsSortBy> {
  @IsEnum(BlogsSortBy)
  sortBy = BlogsSortBy.CreatedAt;

  @TrimIsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    type: String,
    description:
      'Search term for blog Name: Name should contains this term in any position',
    default: null,
  })
  searchNameTerm: string | null = null;
}
