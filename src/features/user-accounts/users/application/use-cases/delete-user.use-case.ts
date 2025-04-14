import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../infrastructure/users.sql.repository';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase
  implements ICommandHandler<DeleteUserCommand, boolean>
{
  constructor(private readonly usersSqlRepository: UsersSqlRepository) {}

  async execute(command: DeleteUserCommand): Promise<boolean> {
    return this.usersSqlRepository.delete(command.id);
  }
}
