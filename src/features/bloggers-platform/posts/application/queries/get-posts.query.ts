import { GetPostQueryParams } from '../../api/models/input/create-post.input-model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewModel } from '../../../../../core/models/base-paginated.view-model';
import { PostViewModel } from '../../api/models/view/post.view-model';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';

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
  constructor(private readonly postsQueryRepository: PostsQueryRepository) {}
  async execute(
    query: GetPostsQuery,
  ): Promise<PaginatedViewModel<PostViewModel[]>> {
    return this.postsQueryRepository.getAll(
      query.currentUserId,
      query.inputQuery,
    );
  }
}
