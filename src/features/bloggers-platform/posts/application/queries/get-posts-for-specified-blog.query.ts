import { GetPostQueryParams } from '../../api/models/input/create-post.input.model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewModel } from '../../../../../core/models/base.paginated.view.model';
import { PostViewModel } from '../../api/models/view/post.view.model';
import { PostsSqlQueryRepository } from '../../infrastructure/posts.sql.query-repository';

export class GetPostsForSpecifiedBlogQuery {
  constructor(
    public currentUserId: string,
    public blogId: string,
    public inputQuery: GetPostQueryParams,
  ) {}
}

@QueryHandler(GetPostsForSpecifiedBlogQuery)
export class GetPostsForSpecifiedBlogQueryHandler
  implements
    IQueryHandler<
      GetPostsForSpecifiedBlogQuery,
      PaginatedViewModel<PostViewModel[]>
    >
{
  constructor(
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
  ) {}
  async execute(
    query: GetPostsForSpecifiedBlogQuery,
  ): Promise<PaginatedViewModel<PostViewModel[]>> {
    return this.postsSqlQueryRepository.getPostsByBlogId(
      query.currentUserId,
      query.blogId,
      query.inputQuery,
    );
  }
}
