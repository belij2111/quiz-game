import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UserAccountConfig } from '../../../config/user-account.config';
import { BadRequestException } from '@nestjs/common';
import { UuidProvider } from '../../../../../core/helpers/uuid.provider';
import { RegistrationEmailResendingInputModel } from '../../api/models/input/registration-email-resending.input-model';
import { UserRegistrationEvent } from '../events/user-registration.event';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class RegistrationEmailResendingCommand {
  constructor(public inputEmail: RegistrationEmailResendingInputModel) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand, void>
{
  constructor(
    private readonly userAccountConfig: UserAccountConfig,
    private readonly usersRepository: UsersRepository,
    private readonly uuidProvider: UuidProvider,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegistrationEmailResendingCommand): Promise<void> {
    const existingUserByEmail = await this.usersRepository.findByEmail(
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
    existingUserByEmail.emailConfirmation.update({
      confirmationCode: newConfirmationCode,
      expirationDate: newExpirationDate,
    });
    await this.usersRepository.updateRegistrationConfirmationCode(
      existingUserByEmail,
    );
    this.eventBus.publish(
      new UserRegistrationEvent(command.inputEmail.email, newConfirmationCode),
    );
  }
}
