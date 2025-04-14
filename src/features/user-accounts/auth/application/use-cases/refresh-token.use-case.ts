import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserAccountConfig } from '../../../config/user-account.config';
import { LoginSuccessViewModel } from '../../api/models/view/login-success.view.model';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevicesSqlRepository } from '../../../security-devices/infrastructure/security-devices.sql.repository';

export class RefreshTokenCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand, LoginSuccessViewModel>
{
  constructor(
    private readonly userAccountConfig: UserAccountConfig,
    private readonly jwtService: JwtService,
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<LoginSuccessViewModel> {
    const payloadForAccessToken = {
      userId: command.userId,
    };
    const payloadForRefreshToken = {
      userId: command.userId,
      deviceId: command.deviceId,
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
    const iatDate = new Date(decodePayload.iat! * 1000).toISOString();
    await this.securityDevicesSqlRepository.update(command.deviceId, iatDate);
    return {
      accessToken,
      refreshToken,
    };
  }
}
