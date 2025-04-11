import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostParamsModel } from '../../api/models/input/post-params.model';
import { PostCreateModel } from '../../api/models/input/create-post.input.model';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';
import { BlogsSqlRepository } from '../../../blogs/infrastructure/blogs.sql.repository';

export class UpdatePostCommand {
  constructor(
    public params: PostParamsModel,
    public postUpdateModel: PostCreateModel,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostCommand, boolean | null>
{
  constructor(
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<boolean | null> {
    await this.blogsSqlRepository.findByIdOrNotFoundFail(command.params.blogId);
    const foundPost = await this.postsSqlRepository.findByIdOrNotFoundFail(
      command.params.postId,
    );
    const updatedPostDto: PostCreateModel = {
      title: command.postUpdateModel.title,
      shortDescription: command.postUpdateModel.shortDescription,
      content: command.postUpdateModel.content,
      blogId: command.params.blogId,
    };
    return await this.postsSqlRepository.update(foundPost.id, updatedPostDto);
  }
}
