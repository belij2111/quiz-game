import { GetCommentQueryParams } from '../../api/models/input/create-comment.input-model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewModel } from '../../../../../core/models/base-paginated.view-model';
import { CommentViewModel } from '../../api/models/view/comment.view.model';
import { CommentsQueryRepository } from '../../infrastructure/comments.query-repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

export class GetCommentsForSpecificPostQuery {
  constructor(
    public currentUserId: string,
    public postId: number,
    public inputQuery: GetCommentQueryParams,
  ) {}
}

@QueryHandler(GetCommentsForSpecificPostQuery)
export class GetCommentsForSpecificPostQueryHandler
  implements
    IQueryHandler<
      GetCommentsForSpecificPostQuery,
      PaginatedViewModel<CommentViewModel[]>
    >
{
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly postsRepository: PostsRepository,
  ) {}
  async execute(
    query: GetCommentsForSpecificPostQuery,
  ): Promise<PaginatedViewModel<CommentViewModel[]>> {
    await this.postsRepository.findByIdOrNotFoundFail(query.postId);
    return this.commentsQueryRepository.getAllByPostId(
      query.currentUserId,
      query.postId,
      query.inputQuery,
    );
  }
}
