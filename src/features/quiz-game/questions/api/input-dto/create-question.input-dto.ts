import { ApiProperty } from '@nestjs/swagger';
import { TrimIsString } from '../../../../../core/decorators/validation/trim-is-string';
import { IsArray, IsEnum, IsOptional, Length } from 'class-validator';
import { BaseSortablePaginationParams } from '../../../../../core/models/base-query-params.input-model';
import { PublishedStatus } from '../enums/published-status.enum';

const BODY_MIN_LENGTH = 10;
const BODY_MAX_LENGTH = 500;

export class CreateQuestionInputDto {
  @TrimIsString()
  @Length(BODY_MIN_LENGTH, BODY_MAX_LENGTH, {
    message: 'question length should be from 10 to 500 symbol',
  })
  @ApiProperty({
    minLength: BODY_MIN_LENGTH,
    maxLength: BODY_MAX_LENGTH,
  })
  body: string;

  @IsArray()
  @ApiProperty({
    type: [String],
    description: `All variants of possible correct answers for current questions Examples: ['6','six','don't know']`,
  })
  correctAnswers: string[];
}

export enum QuestionsSortBy {
  Body = 'body',
  CorrectAnswer = 'correctAnswer',
  CreatedAt = 'createdAt',
}

export class GetQuestionsQueryParams extends BaseSortablePaginationParams<QuestionsSortBy> {
  @IsEnum(QuestionsSortBy)
  sortBy: QuestionsSortBy = QuestionsSortBy.CreatedAt;

  @TrimIsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
  })
  bodySearchTerm: string | null = null;

  @IsEnum(PublishedStatus)
  @IsOptional()
  @ApiProperty({
    enum: PublishedStatus,
    required: false,
    description: 'default value: "all"',
  })
  publishedStatus: PublishedStatus;
}
