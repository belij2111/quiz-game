import { GetBlogsQueryParams } from '../../api/models/input/create-blog.input.model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewModel } from '../../../../../core/models/base.paginated.view.model';
import { BlogViewModel } from '../../api/models/view/blog.view.model';
import { BlogsSqlQueryRepository } from '../../infrastructure/blogs.sql.query-repository';

export class GetBlogsQuery {
  constructor(public inputQuery: GetBlogsQueryParams) {}
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsQueryHandler
  implements IQueryHandler<GetBlogsQuery, PaginatedViewModel<BlogViewModel[]>>
{
  constructor(
    private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository,
  ) {}
  async execute(
    query: GetBlogsQuery,
  ): Promise<PaginatedViewModel<BlogViewModel[]>> {
    return this.blogsSqlQueryRepository.getAll(query.inputQuery);
  }
}
