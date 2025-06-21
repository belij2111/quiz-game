import { ApiProperty } from '@nestjs/swagger';
import { QuestionRawDataDto } from '../../dto/question-raw-data.dto';

export class QuestionViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description:
      'Text of question, for example: How many continents are there?',
  })
  body: string;

  @ApiProperty({
    type: [String],
    description: `All variants of possible correct answers for current questions Examples: ['6','six','don't know']`,
  })
  correctAnswers: string[];

  @ApiProperty({
    default: false,
    description: 'If question is completed and can be used in the Quiz game',
    required: false,
  })
  published: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time', required: false, nullable: true })
  updatedAt: string;

  static mapToView(question: QuestionRawDataDto): QuestionViewDto {
    const model = new QuestionViewDto();
    model.id = question.id;
    model.body = question.body;
    model.correctAnswers = question.correctAnswers;
    model.published = question.published;
    model.createdAt = question.createdAt.toISOString();
    model.updatedAt = question.updatedAt.toISOString();
    return model;
  }
}
