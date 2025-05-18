import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewModel } from '../../api/models/view/comment.view.model';
import { CommentsQueryRepository } from '../../infrastructure/comments.query-repository';

export class GetCommentByIdQuery {
  constructor(
    public currentUserId: string,
    public id: number,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler
  implements IQueryHandler<GetCommentByIdQuery, CommentViewModel>
{
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}
  async execute(query: GetCommentByIdQuery): Promise<CommentViewModel> {
    return this.commentsQueryRepository.getById(query.currentUserId, query.id);
  }
}
