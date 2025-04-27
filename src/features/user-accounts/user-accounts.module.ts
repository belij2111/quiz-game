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
import { CryptoService } from './crypto/crypto.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersSqlRepository } from './users/infrastructure/users.sql.repository';
import { UsersSqlQueryRepository } from './users/infrastructure/users.sql.query-repository';
import { SecurityDevicesSqlRepository } from './security-devices/infrastructure/security-devices.sql.repository';
import { SecurityDevicesSqlQueryRepository } from './security-devices/infrastructure/security-devices.sql.query-repository';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { DeleteAllSecurityDevicesExcludingCurrentUseCase } from './security-devices/application/use-cases/delete-all-security-devices-excluding-current.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteSecurityDeviceUseCase } from './security-devices/application/use-cases/delete-security-device.use-case';
import { CreateUserUseCase } from './users/application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from './users/application/use-cases/delete-user.use-case';
import { LoginUserUseCase } from './auth/application/use-cases/login-user.use-case';
import { RefreshTokenUseCase } from './auth/application/use-cases/refresh-token.use-case';
import { RegisterUserUseCase } from './auth/application/use-cases/register-user.use-case';
import { ConfirmationRegistrationUserUseCase } from './auth/application/use-cases/confirmation-registration-user.use-case';
import { RegistrationEmailResendingUseCase } from './auth/application/use-cases/registration-email-resending.use-case';
import { PasswordRecoveryUseCase } from './auth/application/use-cases/password-recovery.use-case';
import { NewPasswordUseCase } from './auth/application/use-cases/new-password.use-case';
import { LogoutUseCase } from './auth/application/use-cases/logout.use-case';
import { GetInfoAboutCurrentUserQueryHandler } from './auth/application/queries/get-info-about-current-user.query';
import { GetAllUsersQueryHandler } from './users/application/queries/get-all-users.query';
import { GetUserByIdQueryHandler } from './users/application/queries/get-user-by-id.query';
import { GetDevicesQueryHandler } from './security-devices/application/queries/get-devices.query';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/domain/user.entity';
import { EmailConfirmation } from './users/domain/email-confirmation.entity';
import { UsersRepository } from './users/infrastructure/users.repository';
import { UsersQueryRepository } from './users/infrastructure/users.query-repository';

const strategies = [BasicStrategy, LocalStrategy, JwtStrategy];
const services = [AuthService, JwtService, CryptoService];
const useCases = [
  CreateUserUseCase,
  DeleteUserUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
  RegisterUserUseCase,
  ConfirmationRegistrationUserUseCase,
  RegistrationEmailResendingUseCase,
  PasswordRecoveryUseCase,
  NewPasswordUseCase,
  LogoutUseCase,
  DeleteAllSecurityDevicesExcludingCurrentUseCase,
  DeleteSecurityDeviceUseCase,
];
const queries = [
  GetInfoAboutCurrentUserQueryHandler,
  GetAllUsersQueryHandler,
  GetUserByIdQueryHandler,
  GetDevicesQueryHandler,
];
const repositories = [
  SecurityDevicesSqlRepository,
  SecurityDevicesSqlQueryRepository,
  UsersSqlRepository,
  UsersSqlQueryRepository,
  UsersRepository,
  UsersQueryRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailConfirmation]),
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
    UserAccountConfig,
    UuidProvider,
    RefreshTokenGuard,
    ...strategies,
    ...services,
    ...useCases,
    ...queries,
    ...repositories,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [UsersSqlRepository],
})
export class UserAccountsModule {}
