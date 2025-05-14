import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogViewModel } from '../../api/models/view/blog.view.model';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';

export class GetBlogByIdQuery {
  constructor(public blogId: number) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler
  implements IQueryHandler<GetBlogByIdQuery, BlogViewModel>
{
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}
  async execute(query: GetBlogByIdQuery): Promise<BlogViewModel> {
    return this.blogsQueryRepository.getById(query.blogId);
  }
}
