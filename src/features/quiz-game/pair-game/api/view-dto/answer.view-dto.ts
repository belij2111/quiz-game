import { ApiProperty } from '@nestjs/swagger';
import { AnswerStatus } from '../enums/answer-status.enum';
import { AnswerRawDataDto } from '../../infrastructure/dto/answer-raw-data.dto';

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

  static mapToView(answer: AnswerRawDataDto): AnswerViewDto {
    const dto = new AnswerViewDto();
    dto.questionId = answer.questionId;
    dto.answerStatus = answer.answerStatus;
    dto.addedAt = answer.createdAt.toISOString();
    return dto;
  }
}
