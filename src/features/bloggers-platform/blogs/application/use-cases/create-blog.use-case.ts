import { BlogCreateModel } from '../../api/models/input/create-blog.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql.repository';
import { UuidProvider } from '../../../../../core/helpers/uuid.provider';
import { Blog } from '../../domain/blog.sql.entity';

export class CreateBlogCommand {
  constructor(public blogCreateModel: BlogCreateModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, string>
{
  constructor(
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly uuidProvider: UuidProvider,
  ) {}

  async execute(command: CreateBlogCommand): Promise<string> {
    const newBlogDto: Blog = {
      id: this.uuidProvider.generate(),
      name: command.blogCreateModel.name,
      description: command.blogCreateModel.description,
      websiteUrl: command.blogCreateModel.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    };
    return await this.blogsSqlRepository.create(newBlogDto);
  }
}
