import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UuidProvider } from '../../../../../core/helpers/uuid.provider';
import { Post } from '../../domain/post.sql.entity';
import { PostCreateModel } from '../../api/models/input/create-post.input.model';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';
import { BlogsSqlRepository } from '../../../blogs/infrastructure/blogs.sql.repository';

export class CreatePostCommand {
  constructor(public postCreateModel: PostCreateModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, string>
{
  constructor(
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly uuidProvider: UuidProvider,
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const foundBlog = await this.blogsSqlRepository.findByIdOrNotFoundFail(
      command.postCreateModel.blogId,
    );
    const newPostDto: Post = {
      id: this.uuidProvider.generate(),
      title: command.postCreateModel.title,
      shortDescription: command.postCreateModel.shortDescription,
      content: command.postCreateModel.content,
      blogId: foundBlog.id,
      createdAt: new Date(),
    };
    return await this.postsSqlRepository.create(newPostDto);
  }
}
