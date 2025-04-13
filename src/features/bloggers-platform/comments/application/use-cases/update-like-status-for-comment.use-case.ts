import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeInputModel } from '../../../likes/api/models/input/like.input.model';
import { UuidProvider } from '../../../../../core/helpers/uuid.provider';
import { LikeForComment } from '../../../likes/domain/like-for-comment.sql.entity';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';
import { LikesForCommentSqlRepository } from '../../../likes/infrastructure/likes-for-comment.sql.repository';

export class UpdateLikeStatusForCommentCommand {
  constructor(
    public currentUserId: string,
    public commentId: string,
    public likeInputModel: LikeInputModel,
  ) {}
}

@CommandHandler(UpdateLikeStatusForCommentCommand)
export class UpdateLikeStatusForCommentUseCase
  implements ICommandHandler<UpdateLikeStatusForCommentCommand, boolean | null>
{
  constructor(
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly likesForCommentSqlRepository: LikesForCommentSqlRepository,
    private readonly uuidProvider: UuidProvider,
  ) {}

  async execute(
    command: UpdateLikeStatusForCommentCommand,
  ): Promise<boolean | null> {
    await this.commentsSqlRepository.findByIdOrNotFoundFail(command.commentId);
    const foundLike = await this.likesForCommentSqlRepository.find(
      command.currentUserId,
      command.commentId,
    );
    if (foundLike) {
      return await this.likesForCommentSqlRepository.update(
        foundLike,
        command.likeInputModel,
      );
    }
    const likeDto: LikeForComment = {
      id: this.uuidProvider.generate(),
      createdAt: new Date(),
      status: command.likeInputModel.likeStatus,
      userId: command.currentUserId,
      commentId: command.commentId,
    };
    await this.likesForCommentSqlRepository.create(likeDto);
    return true;
  }
}
