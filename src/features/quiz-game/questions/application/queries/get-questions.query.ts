import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuestionViewDto } from '../../api/view-dto/question.view-dto';
import { QuestionQueryRepository } from '../../infrastructure/questions.query-repository';
import { GetQuestionsQueryParams } from '../../api/input-dto/create-question.input-dto';
import { PaginatedViewModel } from '../../../../../core/models/base-paginated.view-model';

export class GetQuestionsQuery {
  constructor(public inputQuery: GetQuestionsQueryParams) {}
}

@QueryHandler(GetQuestionsQuery)
export class GetQuestionsQueryHandler
  implements
    IQueryHandler<GetQuestionsQuery, PaginatedViewModel<QuestionViewDto[]>>
{
  constructor(
    private readonly questionQueryRepository: QuestionQueryRepository,
  ) {}
  async execute(
    query: GetQuestionsQuery,
  ): Promise<PaginatedViewModel<QuestionViewDto[]>> {
    return await this.questionQueryRepository.getAll(query.inputQuery);
  }
}
