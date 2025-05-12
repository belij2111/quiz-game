import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from '../../domain/post.entity';
import { CreatePostDto } from '../../dto/create-post.dto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class CreatePostCommand {
  constructor(
    public postCreateModel: CreatePostDto,
    public blogId: number,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, number>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<number> {
    await this.blogsRepository.findByIdOrNotFoundFail(command.blogId);
    const post = Post.create(command.postCreateModel, command.blogId);
    return await this.postsRepository.create(post);
  }
}
