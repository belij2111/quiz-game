import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UuidProvider } from '../../../../../core/helpers/uuid.provider';
import { UserCreateModel } from '../../api/models/input/create-user.input.model';
import { CryptoService } from '../../../crypto/crypto.service';
import { UserAccountConfig } from '../../../config/user-account.config';
import { UsersSqlRepository } from '../../infrastructure/users.sql.repository';
import { BadRequestException } from '@nestjs/common';
import { User } from '../../domain/user.entity';

export class CreateUserCommand {
  constructor(public userCreateModel: UserCreateModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserCommand, number>
{
  constructor(
    private readonly bcryptService: CryptoService,
    private readonly uuidProvider: UuidProvider,
    private readonly userAccountConfig: UserAccountConfig,
    private readonly usersSqlRepository: UsersSqlRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<number> {
    const existingUserByLogin =
      await this.usersSqlRepository.findByLoginOrEmail(
        command.userCreateModel.login,
      );
    if (existingUserByLogin) {
      throw new BadRequestException([
        { field: 'login', message: 'Login is not unique' },
      ]);
    }
    const existingUserByEmail =
      await this.usersSqlRepository.findByLoginOrEmail(
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
    const expirationTime = this.userAccountConfig.CONFIRMATION_CODE_EXPIRATION;
    const newUser: User = {
      id: this.uuidProvider.generate(),
      login: command.userCreateModel.login,
      password: passHash,
      email: command.userCreateModel.email,
      createdAt: new Date(),
      confirmationCode: this.uuidProvider.generate(),
      expirationDate: new Date(new Date().getTime() + expirationTime),
      isConfirmed: true,
    };
    return this.usersSqlRepository.create(newUser);
  }
}
