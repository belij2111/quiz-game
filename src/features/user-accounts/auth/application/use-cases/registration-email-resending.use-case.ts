import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UserAccountConfig } from '../../../config/user-account.config';
import { BadRequestException } from '@nestjs/common';
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql.repository';
import { UuidProvider } from '../../../../../core/helpers/uuid.provider';
import { RegistrationEmailResendingModel } from '../../api/models/input/registration-email-resending.model';
import { UserRegistrationEvent } from '../events/user-registration.event';

export class RegistrationEmailResendingCommand {
  constructor(public inputEmail: RegistrationEmailResendingModel) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand, void>
{
  constructor(
    private readonly userAccountConfig: UserAccountConfig,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly uuidProvider: UuidProvider,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegistrationEmailResendingCommand): Promise<void> {
    const existingUserByEmail =
      await this.usersSqlRepository.findByLoginOrEmail(
        command.inputEmail.email,
      );
    if (!existingUserByEmail) {
      throw new BadRequestException([
        { field: 'email', message: 'User with this email does not exist' },
      ]);
    }
    if (existingUserByEmail.isConfirmed) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'The account has already been confirmed',
        },
      ]);
    }
    const expirationTime = this.userAccountConfig.CONFIRMATION_CODE_EXPIRATION;
    const newConfirmationCode = this.uuidProvider.generate();
    const newExpirationDate = new Date(new Date().getTime() + expirationTime);

    await this.usersSqlRepository.updateRegistrationConfirmation(
      existingUserByEmail.id,
      newConfirmationCode,
      newExpirationDate,
    );
    this.eventBus.publish(
      new UserRegistrationEvent(command.inputEmail.email, newConfirmationCode),
    );
  }
}
