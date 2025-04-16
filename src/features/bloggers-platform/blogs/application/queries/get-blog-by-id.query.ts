import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogViewModel } from '../../api/models/view/blog.view.model';
import { BlogsSqlQueryRepository } from '../../infrastructure/blogs.sql.query-repository';

export class GetBlogByIdQuery {
  constructor(public blogId: string) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler
  implements IQueryHandler<GetBlogByIdQuery, BlogViewModel | null>
{
  constructor(
    private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository,
  ) {}
  async execute(query: GetBlogByIdQuery): Promise<BlogViewModel | null> {
    return this.blogsSqlQueryRepository.getById(query.blogId);
  }
}
