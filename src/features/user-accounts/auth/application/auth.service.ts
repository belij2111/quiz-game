import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CryptoService } from '../../crypto/crypto.service';
import { LoginInputModel } from '../api/models/input/login.input.model';
import { NewPasswordRecoveryInputModel } from '../api/models/input/new-password-recovery-input.model';
import { UsersSqlRepository } from '../../users/infrastructure/users.sql.repository';
import { SecurityDevicesSqlRepository } from '../../security-devices/infrastructure/security-devices.sql.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly bcryptService: CryptoService,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async validateUser(loginInput: LoginInputModel): Promise<string | null> {
    const { loginOrEmail, password } = loginInput;
    const user = await this.usersSqlRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isPasswordValid = await this.bcryptService.checkPassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    return user.id.toString();
  }

  async newPassword(inputData: NewPasswordRecoveryInputModel) {
    const { newPassword, recoveryCode } = inputData;
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

  async logout(deviceId: string) {
    const foundDevice =
      await this.securityDevicesSqlRepository.findById(deviceId);
    if (!foundDevice) {
      throw new NotFoundException('The device was not found');
    }
    return await this.securityDevicesSqlRepository.deleteById(
      foundDevice.deviceId,
    );
  }
}
