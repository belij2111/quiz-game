import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeViewModel } from '../../api/models/view/me.view.model';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';

export class GetInfoAboutCurrentUserQuery {
  constructor(public currentUserId: string) {}
}

@QueryHandler(GetInfoAboutCurrentUserQuery)
export class GetInfoAboutCurrentUserQueryHandler
  implements IQueryHandler<GetInfoAboutCurrentUserQuery, MeViewModel | null>
{
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}
  async execute(
    query: GetInfoAboutCurrentUserQuery,
  ): Promise<MeViewModel | null> {
    return this.usersQueryRepository.getAuthUserById(query.currentUserId);
  }
}
