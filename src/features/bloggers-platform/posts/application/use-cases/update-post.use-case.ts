import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { CreatePostInputModel } from '../../api/models/input/create-post.input-model';

export class UpdatePostCommand {
  constructor(
    public blogId: number,
    public postId: number,
    public postUpdateModel: CreatePostInputModel,
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
    await this.blogsRepository.findByIdOrNotFoundFail(command.blogId);
    const foundPost = await this.postsRepository.findByIdOrNotFoundFail(
      command.postId,
    );
    foundPost.update({
      title: command.postUpdateModel.title,
      shortDescription: command.postUpdateModel.shortDescription,
      content: command.postUpdateModel.content,
    });
    return await this.postsRepository.update(foundPost);
  }
}
