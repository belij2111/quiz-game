import { ApiProperty } from '@nestjs/swagger';
import { AnswerStatus } from '../enums/answer-status.enum';

export class AnswerViewDto {
  @ApiProperty()
  questionId: string;

  @ApiProperty({
    enum: AnswerStatus,
    required: false,
  })
  answerStatus: AnswerStatus;

  @ApiProperty({ format: 'date-time', required: false })
  addedAt: string;
}
