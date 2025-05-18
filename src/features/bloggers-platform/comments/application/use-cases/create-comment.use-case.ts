import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentInputModel } from '../../api/models/input/create-comment.input-model';
import { UsersRepository } from '../../../../user-accounts/users/infrastructure/users.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { Comment } from '../../domain/comment.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class CreateCommentCommand {
  constructor(
    public userId: string,
    public postId: number,
    public commentCreateModel: CreateCommentInputModel,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, any>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(command: CreateCommentCommand): Promise<string> {
    await this.usersRepository.findByIdOrNotFoundFail(command.userId);
    await this.postsRepository.findByIdOrNotFoundFail(command.postId);
    const comment = Comment.create(
      command.commentCreateModel,
      command.postId,
      command.userId,
    );
    return await this.commentsRepository.create(comment);
  }
}
