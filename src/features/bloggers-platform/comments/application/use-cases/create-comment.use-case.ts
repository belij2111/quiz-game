import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UuidProvider } from '../../../../../core/helpers/uuid.provider';
import { UsersSqlRepository } from '../../../../user-accounts/users/infrastructure/users.sql.repository';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';
import { CommentCreateModel } from '../../api/models/input/create-comment.input.model';
import { Comment } from '../../domain/comment.sql.entity';
import { PostsSqlRepository } from '../../../posts/infrastructure/posts.sql.repository';

export class CreateCommentCommand {
  constructor(
    public userId: string,
    public postId: string,
    public commentCreateModel: CommentCreateModel,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, string>
{
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly uuidProvider: UuidProvider,
  ) {}

  async execute(command: CreateCommentCommand): Promise<string> {
    const fondUser = await this.usersSqlRepository.findByIdOrNotFoundFail(
      command.userId,
    );
    const fondPost = await this.postsSqlRepository.findByIdOrNotFoundFail(
      command.postId,
    );
    const createCommentDto: Comment = {
      id: this.uuidProvider.generate(),
      content: command.commentCreateModel.content,
      createdAt: new Date(),
      postId: fondPost.id,
      userId: fondUser.id,
    };
    return await this.commentsSqlRepository.create(createCommentDto);
  }
}
