import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputModel } from '../../api/models/input/create-user.input-model';
import { CryptoService } from '../../../crypto/crypto.service';
import { BadRequestException } from '@nestjs/common';
import { User } from '../../domain/user.entity';
import { UsersRepository } from '../../infrastructure/users.repository';

export class CreateUserCommand {
  constructor(public userCreateModel: CreateUserInputModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserCommand, string>
{
  constructor(
    private readonly bcryptService: CryptoService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const existingUserByLogin = await this.usersRepository.findByLoginOrEmail(
      command.userCreateModel.login,
    );
    if (existingUserByLogin) {
      throw new BadRequestException([
        { field: 'login', message: 'Login is not unique' },
      ]);
    }
    const existingUserByEmail = await this.usersRepository.findByLoginOrEmail(
      command.userCreateModel.email,
    );
    if (existingUserByEmail) {
      throw new BadRequestException([
        { field: 'email', message: 'Email is not unique' },
      ]);
    }
    const passHash = await this.bcryptService.generateHash(
      command.userCreateModel.password,
    );
    const user = User.create(command.userCreateModel);
    user.password = passHash;
    return this.usersRepository.create(user);
  }
}
