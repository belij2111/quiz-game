import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UpdateCommentDto } from '../../dto/update-comment.dto';

export class UpdateCommentCommand {
  constructor(
    public userId: string,
    public commentId: number,
    public commentUpdateModel: UpdateCommentDto,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand, boolean | null>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<boolean | null> {
    const foundComment = await this.commentsRepository.findByIdOrNotFoundFail(
      command.commentId,
    );
    if (foundComment.userId !== command.userId) {
      throw new ForbiddenException([
        { field: 'userId', message: 'The comment is not your own' },
      ]);
    }
    foundComment.update({
      content: command.commentUpdateModel.content,
    });
    return await this.commentsRepository.update(foundComment);
  }
}
