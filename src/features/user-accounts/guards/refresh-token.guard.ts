import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserAccountConfig } from '../config/user-account.config';
import { SecurityDevicesSqlRepository } from '../security-devices/infrastructure/security-devices.sql.repository';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
    private readonly userAccountConfig: UserAccountConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const secret = this.userAccountConfig.REFRESH_TOKEN_SECRET;
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret,
      });
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException();
    }

    const deviceSession = await this.securityDevicesSqlRepository.findById(
      payload.deviceId,
    );
    if (!deviceSession) {
      throw new UnauthorizedException();
    }
    const tokenVersionFromPayload = new Date(payload.iat! * 1000).toISOString();
    const tokenVersionInDB = deviceSession.iatDate.toISOString();
    if (tokenVersionFromPayload !== tokenVersionInDB) {
      throw new UnauthorizedException();
    }
    request.user = payload.userId;
    request.deviceId = payload.deviceId;
    return true;
  }
}
