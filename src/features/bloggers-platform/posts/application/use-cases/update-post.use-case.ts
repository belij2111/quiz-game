import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostParamsModel } from '../../api/models/input/post-params.model';
import { UpdatePostInputModel } from '../../api/models/input/update-post.input-model';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class UpdatePostCommand {
  constructor(
    public params: PostParamsModel,
    public postUpdateModel: UpdatePostInputModel,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostCommand, boolean | null>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<boolean | null> {
    await this.blogsRepository.findByIdOrNotFoundFail(command.params.blogId);
    const foundPost = await this.postsRepository.findByIdOrNotFoundFail(
      command.params.postId,
    );
    foundPost.update({
      title: command.postUpdateModel.title,
      shortDescription: command.postUpdateModel.shortDescription,
      content: command.postUpdateModel.content,
    });
    return await this.postsRepository.update(foundPost);
  }
}
