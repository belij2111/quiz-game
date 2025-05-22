import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeDto } from '../../../likes/dto/like.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikesForPostRepository } from '../../../likes/infrastructure/likes-for-post.repository';
import { LikeForPost } from '../../../likes/domain/like-for-post.entity';

export class UpdateLikeStatusForPostCommand {
  constructor(
    public currentUserId: string,
    public postId: any,
    public likeDto: LikeDto,
  ) {}
}

@CommandHandler(UpdateLikeStatusForPostCommand)
export class UpdateLikeStatusForPostUseCase
  implements
    ICommandHandler<UpdateLikeStatusForPostCommand, void | boolean | null>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly likesForPostRepository: LikesForPostRepository,
  ) {}

  async execute(
    command: UpdateLikeStatusForPostCommand,
  ): Promise<void | boolean | null> {
    await this.postsRepository.findByIdOrNotFoundFail(command.postId);
    const foundLike = await this.likesForPostRepository.find(
      command.currentUserId,
      command.postId,
    );
    if (foundLike) {
      foundLike.update({ likeStatus: command.likeDto.likeStatus });
      return await this.likesForPostRepository.update(foundLike);
    }
    const like = LikeForPost.create(
      command.likeDto,
      command.currentUserId,
      command.postId,
    );
    return await this.likesForPostRepository.create(like);
  }
}
