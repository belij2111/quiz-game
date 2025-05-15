import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostParamsModel } from '../../api/models/input/post-params.model';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class DeletePostCommand {
  constructor(public params: PostParamsModel) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand, boolean | null>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<boolean | null> {
    await this.blogsRepository.findByIdOrNotFoundFail(command.params.blogId);
    const foundPost: any = await this.postsRepository.findByIdOrNotFoundFail(
      command.params.postId,
    );
    return this.postsRepository.delete(foundPost.id);
  }
}
