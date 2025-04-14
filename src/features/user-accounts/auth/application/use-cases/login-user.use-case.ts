import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserAccountConfig } from '../../../config/user-account.config';
import { LoginSuccessViewModel } from '../../api/models/view/login-success.view.model';
import { randomUUID } from 'node:crypto';
import { SecurityDevices } from '../../../security-devices/domain/security-devices.sql.entity';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevicesSqlRepository } from '../../../security-devices/infrastructure/security-devices.sql.repository';

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
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginSuccessViewModel> {
    const payloadForAccessToken = {
      userId: command.userId,
    };
    const payloadForRefreshToken = {
      userId: command.userId,
      deviceId: randomUUID(),
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
    const deviceSession: SecurityDevices = {
      userId: decodePayload.userId,
      deviceId: decodePayload.deviceId,
      ip: command.ip,
      deviceName: command.deviceName,
      iatDate: new Date(decodePayload.iat! * 1000),
      expDate: new Date(decodePayload.exp! * 1000),
    };
    await this.securityDevicesSqlRepository.create(deviceSession);
    return {
      accessToken,
      refreshToken,
    };
  }
}
