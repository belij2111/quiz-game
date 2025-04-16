import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewModel } from '../../api/models/view/comment.view.model';
import { CommentsSqlQueryRepository } from '../../infrastructure/comments.sql.query-repository';

export class GetCommentByIdQuery {
  constructor(
    public currentUserId: string,
    public id: string,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler
  implements IQueryHandler<GetCommentByIdQuery, CommentViewModel | null>
{
  constructor(
    private readonly commentsSqlQueryRepository: CommentsSqlQueryRepository,
  ) {}
  async execute(query: GetCommentByIdQuery): Promise<CommentViewModel | null> {
    return this.commentsSqlQueryRepository.getCommentById(
      query.currentUserId,
      query.id,
    );
  }
}
