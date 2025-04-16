import { GetUsersQueryParams } from '../../api/models/input/create-user.input.model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewModel } from '../../../../../core/models/base.paginated.view.model';
import { UserViewModel } from '../../api/models/view/user.view.model';
import { UsersSqlQueryRepository } from '../../infrastructure/users.sql.query-repository';

export class GetAllUsersQuery {
  constructor(public inputQuery: GetUsersQueryParams) {}
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler
  implements
    IQueryHandler<GetAllUsersQuery, PaginatedViewModel<UserViewModel[]>>
{
  constructor(
    private readonly usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}
  async execute(
    query: GetAllUsersQuery,
  ): Promise<PaginatedViewModel<UserViewModel[]>> {
    return this.usersSqlQueryRepository.getAll(query.inputQuery);
  }
}
