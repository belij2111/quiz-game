import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserAccountConfig } from '../../../config/user-account.config';
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql.repository';
import { MailService } from '../../../../notifications/mail.service';
import { UuidProvider } from '../../../../../core/helpers/uuid.provider';
import { PasswordRecoveryInputModel } from '../../api/models/input/password-recovery-input.model';

export class PasswordRecoveryCommand {
  constructor(public inputEmail: PasswordRecoveryInputModel) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand, void>
{
  constructor(
    private readonly userAccountConfig: UserAccountConfig,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly mailService: MailService,
    private readonly uuidProvider: UuidProvider,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<void> {
    const existingUserByEmail =
      await this.usersSqlRepository.findByLoginOrEmail(
        command.inputEmail.email,
      );
    if (!existingUserByEmail) return;
    const expirationTime = this.userAccountConfig.CONFIRMATION_CODE_EXPIRATION;
    const recoveryCode = this.uuidProvider.generate();
    const newExpirationDate = new Date(new Date().getTime() + expirationTime);
    await this.usersSqlRepository.updateRegistrationConfirmation(
      existingUserByEmail.id,
      recoveryCode,
      newExpirationDate,
    );
    this.mailService.sendEmail(
      command.inputEmail.email,
      recoveryCode,
      'passwordRecovery',
    );
  }
}
