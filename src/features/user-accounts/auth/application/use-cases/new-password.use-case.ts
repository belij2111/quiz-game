import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql.repository';
import { NewPasswordRecoveryInputModel } from '../../api/models/input/new-password-recovery-input.model';
import { CryptoService } from '../../../crypto/crypto.service';

export class NewPasswordCommand {
  constructor(public inputData: NewPasswordRecoveryInputModel) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase
  implements ICommandHandler<NewPasswordCommand, void>
{
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly bcryptService: CryptoService,
  ) {}

  async execute(command: NewPasswordCommand): Promise<void> {
    const { newPassword, recoveryCode } = command.inputData;
    const existingUserByRecoveryCode =
      await this.usersSqlRepository.findByConfirmationCode(recoveryCode);
    if (!existingUserByRecoveryCode) {
      throw new BadRequestException([
        { field: 'code', message: 'Confirmation code is incorrect' },
      ]);
    }
    const newPasswordHash = await this.bcryptService.generateHash(newPassword);
    await this.usersSqlRepository.updatePassword(
      existingUserByRecoveryCode.id,
      newPasswordHash,
    );
  }
}
