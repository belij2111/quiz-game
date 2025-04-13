import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';
import { ForbiddenException } from '@nestjs/common';

export class DeleteCommentCommand {
  constructor(
    public userId: string,
    public commentId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand, boolean>
{
  constructor(private readonly commentsSqlRepository: CommentsSqlRepository) {}

  async execute(command: DeleteCommentCommand): Promise<boolean> {
    const foundComment =
      await this.commentsSqlRepository.findByIdOrNotFoundFail(
        command.commentId,
      );
    if (foundComment.userId !== command.userId) {
      throw new ForbiddenException([
        { field: 'user', message: 'The comment is not your own' },
      ]);
    }
    return await this.commentsSqlRepository.delete(foundComment.id);
  }
}
