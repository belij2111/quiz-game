import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';
import { LikeInputModel } from '../../../likes/api/models/input/like.input.model';
import { LikesForPostSqlRepository } from '../../../likes/infrastructure/likes-for-post.sql.repository';
import { UuidProvider } from '../../../../../core/helpers/uuid.provider';
import { LikeForPost } from '../../../likes/domain/like-for-post.sql.entity';

export class UpdateLikeStatusCommand {
  constructor(
    public currentUserId: string,
    public postId: string,
    public likeInputModel: LikeInputModel,
  ) {}
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase
  implements ICommandHandler<UpdateLikeStatusCommand, boolean | null>
{
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly likesForPostSqlRepository: LikesForPostSqlRepository,
    private readonly uuidProvider: UuidProvider,
  ) {}

  async execute(command: UpdateLikeStatusCommand): Promise<boolean | null> {
    await this.postsSqlRepository.findByIdOrNotFoundFail(command.postId);
    const foundLike = await this.likesForPostSqlRepository.find(
      command.currentUserId,
      command.postId,
    );
    if (foundLike) {
      return await this.likesForPostSqlRepository.update(
        foundLike,
        command.likeInputModel,
      );
    }
    const likeDto: LikeForPost = {
      id: this.uuidProvider.generate(),
      createdAt: new Date(),
      status: command.likeInputModel.likeStatus,
      userId: command.currentUserId,
      postId: command.postId,
    };
    await this.likesForPostSqlRepository.create(likeDto);
    return true;
  }
}
