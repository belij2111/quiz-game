import { BlogCreateModel } from '../../api/models/input/create-blog.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql.repository';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public blogUpdateModel: BlogCreateModel,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase
  implements ICommandHandler<UpdateBlogCommand, boolean | null>
{
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: UpdateBlogCommand): Promise<boolean | null> {
    const foundBlog = await this.blogsSqlRepository.findByIdOrNotFoundFail(
      command.id,
    );
    const updatedBlogDto: BlogCreateModel = {
      name: command.blogUpdateModel.name,
      description: command.blogUpdateModel.description,
      websiteUrl: command.blogUpdateModel.websiteUrl,
    };
    return await this.blogsSqlRepository.update(foundBlog, updatedBlogDto);
  }
}
