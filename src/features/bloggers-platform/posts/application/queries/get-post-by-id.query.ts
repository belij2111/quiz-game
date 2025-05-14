import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostViewModel } from '../../api/models/view/post.view.model';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';

export class GetPostByIdQuery {
  constructor(
    public currentUserId: string,
    public postId: number,
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdHandler
  implements IQueryHandler<GetPostByIdQuery, PostViewModel>
{
  constructor(private readonly postsQueryRepository: PostsQueryRepository) {}
  async execute(query: GetPostByIdQuery): Promise<PostViewModel> {
    return await this.postsQueryRepository.getById(
      query.currentUserId,
      query.postId,
    );
  }
}
