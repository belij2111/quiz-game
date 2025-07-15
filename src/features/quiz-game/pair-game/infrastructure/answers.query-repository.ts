import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Answer } from '../domain/answer.entity';
import { AnswerViewDto } from '../api/view-dto/answer.view-dto';

@Injectable()
export class AnswersQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getByIdOrNotFoundFail(id: string) {
    const answerQuery = this.dataSource.manager
      .createQueryBuilder(Answer, 'a')
      .select([
        'a."question_id" as "questionId"',
        'a."answer_status" as "answerStatus"',
        'a."created_at" as "createdAt"',
      ])
      .where('a.id = :id', { id: id });
    const foundAnswer = await answerQuery.getRawOne();
    if (!foundAnswer) {
      throw new NotFoundException(`Answer with id ${id} found`);
    }
    return AnswerViewDto.mapToView(foundAnswer);
  }
}
