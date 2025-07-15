import { AnswerStatus } from '../../api/enums/answer-status.enum';

export class AnswerRawDataDto {
  questionId: string;
  answerStatus: AnswerStatus;
  createdAt: Date;
}
