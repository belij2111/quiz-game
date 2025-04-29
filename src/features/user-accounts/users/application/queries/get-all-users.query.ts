import { GetUsersQueryParams } from '../../api/models/input/create-user.input.model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewModel } from '../../../../../core/models/base.paginated.view.model';
import { UserViewModel } from '../../api/models/view/user.view.model';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';

export class GetAllUsersQuery {
  constructor(public inputQuery: GetUsersQueryParams) {}
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler
  implements
    IQueryHandler<GetAllUsersQuery, PaginatedViewModel<UserViewModel[]>>
{
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}
  async execute(
    query: GetAllUsersQuery,
  ): Promise<PaginatedViewModel<UserViewModel[]>> {
    return this.usersQueryRepository.getAll(query.inputQuery);
  }
}
