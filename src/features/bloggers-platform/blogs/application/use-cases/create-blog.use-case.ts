import { BlogCreateModel } from '../../api/models/input/create-blog.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Blog } from '../../domain/blog.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class CreateBlogCommand {
  constructor(public blogCreateModel: BlogCreateModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, string>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<string> {
    const blog = Blog.create(command.blogCreateModel);
    return await this.blogsRepository.create(blog);
  }
}
