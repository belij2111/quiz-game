import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { NewPasswordRecoveryInputModel } from '../../api/models/input/new-password-recovery-input.model';
import { CryptoService } from '../../../crypto/crypto.service';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class NewPasswordCommand {
  constructor(public inputData: NewPasswordRecoveryInputModel) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase
  implements ICommandHandler<NewPasswordCommand, void>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: CryptoService,
  ) {}

  async execute(command: NewPasswordCommand): Promise<void> {
    const { newPassword, recoveryCode } = command.inputData;
    const existingUserByRecoveryCode =
      await this.usersRepository.findByRecoveryCode(recoveryCode);
    if (!existingUserByRecoveryCode) {
      throw new BadRequestException([
        { field: 'code', message: 'Confirmation code is incorrect' },
      ]);
    }
    const newPasswordHash = await this.bcryptService.generateHash(newPassword);
    existingUserByRecoveryCode.update({ password: newPasswordHash });
    await this.usersRepository.updatePassword(existingUserByRecoveryCode);
  }
}
