import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostParamsModel } from '../../api/models/input/post-params.model';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';
import { BlogsSqlRepository } from '../../../blogs/infrastructure/blogs.sql.repository';

export class DeletePostCommand {
  constructor(public params: PostParamsModel) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand, boolean>
{
  constructor(
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<boolean> {
    await this.blogsSqlRepository.findByIdOrNotFoundFail(command.params.blogId);
    const foundPost = await this.postsSqlRepository.findByIdOrNotFoundFail(
      command.params.postId,
    );
    return this.postsSqlRepository.delete(foundPost.id);
  }
}
