import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Question } from '../domain/questions.entity';
import { DataSource } from 'typeorm';
import { QuestionViewDto } from '../api/view-dto/question.view-dto';

@Injectable()
export class QuestionQueryRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getById(id: string): Promise<QuestionViewDto> {
    const foundQuestion = await this.getBaseQuery()
      .where('q.id = :id', { id: id })
      .getRawOne();
    if (!foundQuestion) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    return QuestionViewDto.mapToView(foundQuestion);
  }

  private getBaseQuery() {
    return this.dataSource
      .createQueryBuilder()
      .select([
        'q.id as "id"',
        'q.body as "body"',
        'q.correctAnswers as "correctAnswers"',
        'q.published as "published"',
        'q.createdAt as "createdAt"',
        'q.updatedAt as "updatedAt"',
      ])
      .from(Question, 'q');
  }
}
