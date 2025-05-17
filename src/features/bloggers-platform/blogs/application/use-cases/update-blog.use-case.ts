import { BlogCreateModel } from '../../api/models/input/create-blog.input-model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class UpdateBlogCommand {
  constructor(
    public id: number,
    public blogUpdateModel: BlogCreateModel,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase
  implements ICommandHandler<UpdateBlogCommand, boolean | null>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<boolean | null> {
    const foundBlog = await this.blogsRepository.findByIdOrNotFoundFail(
      command.id,
    );
    foundBlog.update({
      name: command.blogUpdateModel.name,
      description: command.blogUpdateModel.description,
      websiteUrl: command.blogUpdateModel.websiteUrl,
    });
    return await this.blogsRepository.update(foundBlog);
  }
}
