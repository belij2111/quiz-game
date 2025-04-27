import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserViewModel } from '../../api/models/view/user.view.model';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';

export class GetUserByIdQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler
  implements IQueryHandler<GetUserByIdQuery, Promise<UserViewModel | null>>
{
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}
  async execute(
    query: GetUserByIdQuery,
  ): Promise<Promise<UserViewModel | null>> {
    return this.usersQueryRepository.getById(query.id);
  }
}
