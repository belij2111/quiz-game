import { GetPostQueryParams } from '../../api/models/input/create-post.input-model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewModel } from '../../../../../core/models/base.paginated.view.model';
import { PostViewModel } from '../../api/models/view/post.view.model';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class GetPostsForSpecifiedBlogQuery {
  constructor(
    public currentUserId: string,
    public blogId: number,
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
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}
  async execute(
    query: GetPostsForSpecifiedBlogQuery,
  ): Promise<PaginatedViewModel<PostViewModel[]>> {
    await this.blogsRepository.findByIdOrNotFoundFail(query.blogId);
    return this.postsQueryRepository.getAllByBlogId(
      query.currentUserId,
      query.blogId,
      query.inputQuery,
    );
  }
}
