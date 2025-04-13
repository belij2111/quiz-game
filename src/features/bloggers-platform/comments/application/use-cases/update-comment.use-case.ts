import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';
import { ForbiddenException } from '@nestjs/common';
import { CommentCreateModel } from '../../api/models/input/create-comment.input.model';

export class UpdateCommentCommand {
  constructor(
    public userId: string,
    public commentId: string,
    public commentCreateModel: CommentCreateModel,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand, boolean | null>
{
  constructor(private readonly commentsSqlRepository: CommentsSqlRepository) {}

  async execute(command: UpdateCommentCommand): Promise<boolean | null> {
    const foundComment =
      await this.commentsSqlRepository.findByIdOrNotFoundFail(
        command.commentId,
      );
    if (foundComment.userId !== command.userId) {
      throw new ForbiddenException([
        { field: 'user', message: 'The comment is not your own' },
      ]);
    }
    const updateCommentDto: CommentCreateModel = {
      content: command.commentCreateModel.content,
    };
    return await this.commentsSqlRepository.update(
      foundComment,
      updateCommentDto,
    );
  }
}
