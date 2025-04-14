import { UserAccountConfig } from './config/user-account.config';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth/api/auth.controller';
import { AuthService } from './auth/application/auth.service';
import { BasicStrategy } from '../../core/strategies/basic.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from '../../core/strategies/jwt.strategy';
import { UuidProvider } from '../../core/helpers/uuid.provider';
import { APP_GUARD } from '@nestjs/core';
import { UsersController } from './users/api/users.controller';
import { SecurityDevicesController } from './security-devices/api/security-devices.controller';
import { UsersService } from './users/application/users.service';
import { SecurityDevicesService } from './security-devices/application/security-devices.service';
import { CryptoService } from './crypto/crypto.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersSqlRepository } from './users/infrastructure/users.sql.repository';
import { UsersSqlQueryRepository } from './users/infrastructure/users.sql.query-repository';
import { SecurityDevicesSqlRepository } from './security-devices/infrastructure/security-devices.sql.repository';
import { SecurityDevicesSqlQueryRepository } from './security-devices/infrastructure/security-devices.sql.query-repository';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { DeleteAllSecurityDevicesExcludingCurrentUseCase } from './security-devices/application/use-cases/delete-all-security-devices-excluding-current.use-case';
import { CqrsModule } from '@nestjs/cqrs';

const useCases = [DeleteAllSecurityDevicesExcludingCurrentUseCase];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    NotificationsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 20,
      },
    ]),
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    ...useCases,
    UserAccountConfig,
    UsersService,
    UuidProvider,
    AuthService,
    BasicStrategy,
    LocalStrategy,
    JwtStrategy,
    SecurityDevicesService,
    SecurityDevicesSqlRepository,
    SecurityDevicesSqlQueryRepository,
    JwtService,
    CryptoService,
    UsersSqlRepository,
    UsersSqlQueryRepository,
    RefreshTokenGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [UsersSqlRepository],
})
export class UserAccountsModule {}
