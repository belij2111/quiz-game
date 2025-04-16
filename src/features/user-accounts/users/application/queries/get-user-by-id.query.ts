import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserViewModel } from '../../api/models/view/user.view.model';
import { UsersSqlQueryRepository } from '../../infrastructure/users.sql.query-repository';

export class GetUserByIdQuery {
  constructor(public id: number) {}
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler
  implements IQueryHandler<GetUserByIdQuery, Promise<UserViewModel | null>>
{
  constructor(
    private readonly usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}
  async execute(
    query: GetUserByIdQuery,
  ): Promise<Promise<UserViewModel | null>> {
    return this.usersSqlQueryRepository.getById(query.id);
  }
}
