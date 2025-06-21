import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuestionViewDto } from '../../api/view-dto/question.view-dto';
import { QuestionQueryRepository } from '../../infrastructure/questions.query-repository';

export class GetQuestionByIdQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetQuestionByIdQuery)
export class GetQuestionByIdQueryHandler
  implements IQueryHandler<GetQuestionByIdQuery, QuestionViewDto>
{
  constructor(
    private readonly questionQueryRepository: QuestionQueryRepository,
  ) {}
  async execute(query: GetQuestionByIdQuery): Promise<QuestionViewDto> {
    return await this.questionQueryRepository.getById(query.id);
  }
}
