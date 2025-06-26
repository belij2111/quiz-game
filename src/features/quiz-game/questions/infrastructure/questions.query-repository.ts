import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Question } from '../domain/questions.entity';
import { DataSource } from 'typeorm';
import { QuestionViewDto } from '../api/view-dto/question.view-dto';
import { GetQuestionsQueryParams } from '../api/input-dto/create-question.input-dto';
import { PaginatedViewModel } from '../../../../core/models/base-paginated.view-model';
import { SortDirection } from '../../../../core/models/base-query-params.input-model';
import { PublishedStatus } from '../api/enums/published-status.enum';

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

  async getAll(
    inputQuery: GetQuestionsQueryParams,
  ): Promise<PaginatedViewModel<QuestionViewDto[]>> {
    const { bodySearchTerm, publishedStatus, sortBy, sortDirection } =
      inputQuery;
    const query = this.getBaseQuery();
    if (bodySearchTerm) {
      query.where('q.body iLike :body', { body: `%${bodySearchTerm}%` });
    }
    if (publishedStatus && publishedStatus !== PublishedStatus.ALL) {
      const isPublished = publishedStatus === PublishedStatus.PUBLISHED;
      query.andWhere('q.published = :published', {
        published: isPublished,
      });
    }
    const sortDirectionIsInUpperCase =
      sortDirection.toUpperCase() as SortDirection;
    if (sortBy && sortDirectionIsInUpperCase) {
      query.orderBy(`q.${sortBy}`, sortDirectionIsInUpperCase);
    }
    query.skip(inputQuery.calculateSkip()).take(inputQuery.pageSize);

    const foundQuestions = await query.getRawMany();
    const totalCount = await query.getCount();

    const items = foundQuestions.map(QuestionViewDto.mapToView);
    return PaginatedViewModel.mapToView({
      pageNumber: inputQuery.pageNumber,
      pageSize: inputQuery.pageSize,
      totalCount,
      items,
    });
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
