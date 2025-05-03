import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UserAccountConfig } from '../../../config/user-account.config';
import { UuidProvider } from '../../../../../core/helpers/uuid.provider';
import { PasswordRecoveryInputModel } from '../../api/models/input/password-recovery-input.model';
import { UserPasswordRecoveryEvent } from '../events/user-password-recovery.event';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class PasswordRecoveryCommand {
  constructor(public inputEmail: PasswordRecoveryInputModel) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand, void>
{
  constructor(
    private readonly userAccountConfig: UserAccountConfig,
    private readonly usersRepository: UsersRepository,
    private readonly uuidProvider: UuidProvider,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<void> {
    const existingUserByEmail = await this.usersRepository.findByLoginOrEmail(
      command.inputEmail.email,
    );
    if (!existingUserByEmail) return;
    const expirationTime = this.userAccountConfig.CONFIRMATION_CODE_EXPIRATION;
    const recoveryCode = this.uuidProvider.generate();
    const newExpirationDate = new Date(new Date().getTime() + expirationTime);
    existingUserByEmail.update({
      recoveryCode,
      expirationRecoveryCode: newExpirationDate,
    });
    await this.usersRepository.updateRecoveryCode(existingUserByEmail);
    this.eventBus.publish(
      new UserPasswordRecoveryEvent(command.inputEmail.email, recoveryCode),
    );
  }
}
