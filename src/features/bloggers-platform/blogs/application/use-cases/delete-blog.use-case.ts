import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql.repository';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase
  implements ICommandHandler<DeleteBlogCommand, boolean>
{
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const foundBlog = await this.blogsSqlRepository.findByIdOrNotFoundFail(
      command.id,
    );
    return this.blogsSqlRepository.delete(foundBlog.id);
  }
}
