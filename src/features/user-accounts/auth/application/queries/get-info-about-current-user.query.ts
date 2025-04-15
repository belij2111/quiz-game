import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeViewModel } from '../../api/models/view/me.view.model';
import { UsersSqlQueryRepository } from '../../../users/infrastructure/users.sql.query-repository';

export class GetInfoAboutCurrentUserQuery {
  constructor(public currentUserId: number) {}
}

@QueryHandler(GetInfoAboutCurrentUserQuery)
export class GetInfoAboutCurrentUserQueryHandler
  implements IQueryHandler<GetInfoAboutCurrentUserQuery, MeViewModel | null>
{
  constructor(
    private readonly usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}
  async execute(
    query: GetInfoAboutCurrentUserQuery,
  ): Promise<MeViewModel | null> {
    return this.usersSqlQueryRepository.getAuthUserById(query.currentUserId);
  }
}
