import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostViewModel } from '../../api/models/view/post.view.model';
import { PostsSqlQueryRepository } from '../../infrastructure/posts.sql.query-repository';

export class GetPostByIdQuery {
  constructor(
    public currentUserId: string,
    public postId: string,
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdHandler
  implements IQueryHandler<GetPostByIdQuery, PostViewModel | null>
{
  constructor(
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
  ) {}
  async execute(query: GetPostByIdQuery): Promise<PostViewModel | null> {
    return this.postsSqlQueryRepository.getById(
      query.currentUserId,
      query.postId,
    );
  }
}
