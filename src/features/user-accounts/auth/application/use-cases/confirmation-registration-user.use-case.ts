import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql.repository';
import { RegistrationConfirmationCodeModel } from '../../api/models/input/registration-confirmation-code.model';

export class ConfirmationRegistrationUserCommand {
  constructor(public inputCode: RegistrationConfirmationCodeModel) {}
}

@CommandHandler(ConfirmationRegistrationUserCommand)
export class ConfirmationRegistrationUserUseCase
  implements ICommandHandler<ConfirmationRegistrationUserCommand, void>
{
  constructor(private readonly usersSqlRepository: UsersSqlRepository) {}

  async execute(command: ConfirmationRegistrationUserCommand): Promise<void> {
    const confirmedUser = await this.usersSqlRepository.findByConfirmationCode(
      command.inputCode.code,
    );
    if (!confirmedUser) {
      throw new BadRequestException([
        { field: 'code', message: 'Confirmation code is incorrect' },
      ]);
    }
    const isConfirmed = true;
    await this.usersSqlRepository.updateEmailConfirmation(
      confirmedUser.id,
      isConfirmed,
    );
  }
}
