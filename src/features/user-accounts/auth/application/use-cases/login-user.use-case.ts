import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserAccountConfig } from '../../../config/user-account.config';
import { LoginSuccessViewModel } from '../../api/models/view/login-success.view.model';
import { JwtService } from '@nestjs/jwt';
import { UuidProvider } from '../../../../../core/helpers/uuid.provider';
import { SecurityDevice } from '../../../security-devices/domain/security-device.entity';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';

export class LoginUserCommand {
  constructor(
    public userId: string,
    public ip: string,
    public deviceName: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase
  implements ICommandHandler<LoginUserCommand, LoginSuccessViewModel>
{
  constructor(
    private readonly userAccountConfig: UserAccountConfig,
    private readonly jwtService: JwtService,
    private readonly uuidProvider: UuidProvider,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginSuccessViewModel> {
    const payloadForAccessToken = {
      userId: command.userId,
    };
    const payloadForRefreshToken = {
      userId: command.userId,
      deviceId: this.uuidProvider.generate(),
    };
    const accessToken = await this.jwtService.signAsync(payloadForAccessToken, {
      secret: this.userAccountConfig.ACCESS_TOKEN_SECRET,
      expiresIn: this.userAccountConfig.ACCESS_TOKEN_EXPIRATION,
    });

    const refreshToken = await this.jwtService.signAsync(
      payloadForRefreshToken,
      {
        secret: this.userAccountConfig.REFRESH_TOKEN_SECRET,
        expiresIn: this.userAccountConfig.REFRESH_TOKEN_EXPIRATION,
      },
    );
    const decodePayload = this.jwtService.decode(refreshToken);
    const deviceSession = SecurityDevice.create(
      decodePayload.userId,
      decodePayload.deviceId,
      command.ip,
      command.deviceName,
      decodePayload.iat,
      decodePayload.exp,
    );
    await this.securityDevicesRepository.create(deviceSession);
    return {
      accessToken,
      refreshToken,
    };
  }
}
