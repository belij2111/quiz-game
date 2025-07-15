import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AnswerViewDto } from '../../api/view-dto/answer.view-dto';
import { AnswersQueryRepository } from '../../infrastructure/answers.query-repository';

export class GetAnswerResultQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetAnswerResultQuery)
export class GetAnswerResultQueryHandler
  implements IQueryHandler<GetAnswerResultQuery, AnswerViewDto>
{
  constructor(
    private readonly answersQueryRepository: AnswersQueryRepository,
  ) {}
  async execute(query: GetAnswerResultQuery): Promise<AnswerViewDto> {
    return await this.answersQueryRepository.getByIdOrNotFoundFail(query.id);
  }
}
