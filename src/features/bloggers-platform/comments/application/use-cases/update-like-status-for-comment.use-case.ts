import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeDto } from '../../../likes/dto/like.dto';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { LikesForCommentRepository } from '../../../likes/infrastructure/likes-for-comment.repository';
import { LikeForComment } from '../../../likes/domain/like-for-comment.entity';

export class UpdateLikeStatusForCommentCommand {
  constructor(
    public currentUserId: string,
    public commentId: number,
    public likeDto: LikeDto,
  ) {}
}

@CommandHandler(UpdateLikeStatusForCommentCommand)
export class UpdateLikeStatusForCommentUseCase
  implements
    ICommandHandler<UpdateLikeStatusForCommentCommand, void | boolean | null>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly likesForCommentRepository: LikesForCommentRepository,
  ) {}

  async execute(
    command: UpdateLikeStatusForCommentCommand,
  ): Promise<void | boolean | null> {
    await this.commentsRepository.findByIdOrNotFoundFail(command.commentId);
    const foundLike = await this.likesForCommentRepository.find(
      command.currentUserId,
      command.commentId,
    );

    if (foundLike) {
      foundLike.update({ likeStatus: command.likeDto.likeStatus });
      return await this.likesForCommentRepository.update(foundLike);
    }
    const like = LikeForComment.create(
      command.likeDto,
      command.currentUserId,
      command.commentId,
    );
    return await this.likesForCommentRepository.create(like);
  }
}
