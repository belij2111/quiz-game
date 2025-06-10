import { IsEnum, IsOptional, IsUrl, Length, Matches } from 'class-validator';
import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { BaseSortablePaginationParams } from '../../../../../../core/models/base-query-params.input-model';
import { ApiProperty } from '@nestjs/swagger';

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 15;

const DESCRIPTION_MIN_LENGTH = 3;
const DESCRIPTION_MAX_LENGTH = 500;

const WEBSITE_URL_MIN_LENGTH = 15;
const WEBSITE_URL_MAX_LENGTH = 100;
const WEBSITE_URL_PATTERN =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

export class CreateBlogInputModel {
  @TrimIsString()
  @Length(NAME_MIN_LENGTH, NAME_MAX_LENGTH, {
    message: 'name length should be from 3 to 15 symbol',
  })
  @ApiProperty({
    minLength: NAME_MIN_LENGTH,
    maxLength: NAME_MAX_LENGTH,
  })
  name: string;

  @TrimIsString()
  @Length(DESCRIPTION_MIN_LENGTH, DESCRIPTION_MAX_LENGTH, {
    message: 'description length should be from 3 to 500 symbol',
  })
  @ApiProperty({
    minLength: DESCRIPTION_MIN_LENGTH,
    maxLength: DESCRIPTION_MAX_LENGTH,
  })
  description: string;

  @TrimIsString()
  @Length(WEBSITE_URL_MIN_LENGTH, WEBSITE_URL_MAX_LENGTH, {
    message: 'websiteUrl length should be from 3 to 100 symbol',
  })
  @IsUrl()
  @Matches(WEBSITE_URL_PATTERN, { message: 'websiteUrl has invalid format' })
  @ApiProperty({
    minLength: WEBSITE_URL_MIN_LENGTH,
    maxLength: WEBSITE_URL_MAX_LENGTH,
    pattern: `${WEBSITE_URL_PATTERN}`,
  })
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
