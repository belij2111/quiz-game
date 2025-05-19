import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class DeleteCommentCommand {
  constructor(
    public userId: string,
    public commentId: number,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand, boolean | null>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand): Promise<boolean | null> {
    const foundComment = await this.commentsRepository.findByIdOrNotFoundFail(
      command.commentId,
    );
    if (foundComment.userId !== command.userId) {
      throw new ForbiddenException([
        { field: 'user', message: 'The comment is not your own' },
      ]);
    }
    return await this.commentsRepository.delete(foundComment.id);
  }
}
