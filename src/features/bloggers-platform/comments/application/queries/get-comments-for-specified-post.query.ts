import { GetCommentQueryParams } from '../../api/models/input/create-comment.input.model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewModel } from '../../../../../core/models/base.paginated.view.model';
import { CommentViewModel } from '../../api/models/view/comment.view.model';
import { CommentsSqlQueryRepository } from '../../infrastructure/comments.sql.query-repository';

export class GetCommentsForSpecificPostQuery {
  constructor(
    public currentUserId: string,
    public postId: string,
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
    private readonly commentsSqlQueryRepository: CommentsSqlQueryRepository,
  ) {}
  async execute(
    query: GetCommentsForSpecificPostQuery,
  ): Promise<PaginatedViewModel<CommentViewModel[]>> {
    return this.commentsSqlQueryRepository.getCommentsByPostId(
      query.currentUserId,
      query.postId,
      query.inputQuery,
    );
  }
}
