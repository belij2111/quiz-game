import { GetPostQueryParams } from '../../api/models/input/create-post.input.model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewModel } from '../../../../../core/models/base.paginated.view.model';
import { PostViewModel } from '../../api/models/view/post.view.model';
import { PostsSqlQueryRepository } from '../../infrastructure/posts.sql.query-repository';

export class GetPostsQuery {
  constructor(
    public currentUserId: string,
    public inputQuery: GetPostQueryParams,
  ) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler
  implements IQueryHandler<GetPostsQuery, PaginatedViewModel<PostViewModel[]>>
{
  constructor(
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
  ) {}
  async execute(
    query: GetPostsQuery,
  ): Promise<PaginatedViewModel<PostViewModel[]>> {
    return this.postsSqlQueryRepository.getAll(
      query.currentUserId,
      query.inputQuery,
    );
  }
}
