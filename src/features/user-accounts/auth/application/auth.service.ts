import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../crypto/crypto.service';
import { LoginInputModel } from '../api/models/input/login.input.model';
import { LoginSuccessViewModel } from '../api/models/view/login-success.view.model';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { User } from '../../users/domain/user.entity';
import { UserCreateModel } from '../../users/api/models/input/create-user.input.model';
import { UuidProvider } from '../../../../core/helpers/uuid.provider';
import { MailService } from '../../../notifications/mail.service';
import { RegistrationConfirmationCodeModel } from '../api/models/input/registration-confirmation-code.model';
import { RegistrationEmailResendingModel } from '../api/models/input/registration-email-resending.model';
import { PasswordRecoveryInputModel } from '../api/models/input/password-recovery-input.model';
import { NewPasswordRecoveryInputModel } from '../api/models/input/new-password-recovery-input.model';
import { randomUUID } from 'node:crypto';
import { SecurityDevices } from '../../security-devices/domain/security-devices.entity';
import { SecurityDevicesRepository } from '../../security-devices/infrastructure/security-devices.repository';
import { UserAccountConfig } from '../../config/user-account.config';
import { UsersSqlRepository } from '../../users/infrastructure/users.sql.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly userAccountConfig: UserAccountConfig,
    private readonly uuidProvider: UuidProvider,
    private readonly mailService: MailService,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
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

  async login(
    userId: string,
    ip: string,
    deviceName: string,
  ): Promise<LoginSuccessViewModel> {
    const payloadForAccessToken = {
      userId: userId,
    };
    const payloadForRefreshToken = {
      userId: userId,
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
      ip: ip,
      deviceName: deviceName,
      iatDate: new Date(decodePayload.iat! * 1000).toISOString(),
      expDate: new Date(decodePayload.exp! * 1000).toISOString(),
    };
    await this.securityDevicesRepository.create(deviceSession);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(userId: string, deviceId: string) {
    const payloadForAccessToken = {
      userId: userId,
    };
    const payloadForRefreshToken = {
      userId: userId,
      deviceId: deviceId,
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
    await this.securityDevicesRepository.update(deviceId, iatDate);
    return {
      accessToken,
      refreshToken,
    };
  }

  async registerUser(userCreateModel: UserCreateModel) {
    const existingUserByLogin =
      await this.usersSqlRepository.findByLoginOrEmail(userCreateModel.login);
    if (existingUserByLogin) {
      throw new BadRequestException([
        { field: 'login', message: 'Login is not unique' },
      ]);
    }
    const existingUserByEmail =
      await this.usersSqlRepository.findByLoginOrEmail(userCreateModel.email);
    if (existingUserByEmail) {
      throw new BadRequestException([
        { field: 'email', message: 'Email is not unique' },
      ]);
    }
    const passHash = await this.bcryptService.generateHash(
      userCreateModel.password,
    );
    const expirationTime = this.userAccountConfig.CONFIRMATION_CODE_EXPIRATION;
    const newUser: User = {
      login: userCreateModel.login,
      password: passHash,
      email: userCreateModel.email,
      createdAt: new Date(),
      emailConfirmation: {
        confirmationCode: this.uuidProvider.generate(),
        expirationDate: new Date(new Date().getTime() + expirationTime),
        isConfirmed: false,
      },
    };
    await this.usersSqlRepository.create(newUser);
    this.mailService.sendEmail(
      newUser.email,
      newUser.emailConfirmation.confirmationCode,
      'registration',
    );
  }

  async confirmationRegistrationUser(
    inputCode: RegistrationConfirmationCodeModel,
  ) {
    const confirmedUser = await this.usersSqlRepository.findByConfirmationCode(
      inputCode.code,
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

  async registrationEmailResending(
    inputEmail: RegistrationEmailResendingModel,
  ) {
    const existingUserByEmail =
      await this.usersSqlRepository.findByLoginOrEmail(inputEmail.email);
    if (!existingUserByEmail) {
      throw new BadRequestException([
        { field: 'email', message: 'User with this email does not exist' },
      ]);
    }
    if (existingUserByEmail.isConfirmed) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'The account has already been confirmed',
        },
      ]);
    }
    const expirationTime = this.userAccountConfig.CONFIRMATION_CODE_EXPIRATION;
    const newConfirmationCode = this.uuidProvider.generate();
    const newExpirationDate = new Date(new Date().getTime() + expirationTime);

    await this.usersSqlRepository.updateRegistrationConfirmation(
      existingUserByEmail.id,
      newConfirmationCode,
      newExpirationDate,
    );
    this.mailService.sendEmail(
      inputEmail.email,
      newConfirmationCode,
      'registration',
    );
  }

  async passwordRecovery(inputEmail: PasswordRecoveryInputModel) {
    const existingUserByEmail =
      await this.usersSqlRepository.findByLoginOrEmail(inputEmail.email);
    if (!existingUserByEmail) return;
    const expirationTime = this.userAccountConfig.CONFIRMATION_CODE_EXPIRATION;
    const recoveryCode = this.uuidProvider.generate();
    const newExpirationDate = new Date(new Date().getTime() + expirationTime);
    await this.usersSqlRepository.updateRegistrationConfirmation(
      existingUserByEmail.id,
      recoveryCode,
      newExpirationDate,
    );
    this.mailService.sendEmail(
      inputEmail.email,
      recoveryCode,
      'passwordRecovery',
    );
  }

  async newPassword(inputData: NewPasswordRecoveryInputModel) {
    const { newPassword, recoveryCode } = inputData;
    const existingUserByRecoveryCode =
      await this.usersRepository.findByConfirmationCode(recoveryCode);
    if (!existingUserByRecoveryCode) {
      throw new BadRequestException([
        { field: 'code', message: 'Confirmation code is incorrect' },
      ]);
    }
    const newPasswordHash = await this.bcryptService.generateHash(newPassword);
    await this.usersRepository.updatePassword(
      existingUserByRecoveryCode.id,
      newPasswordHash,
    );
  }

  async logout(deviceId: string) {
    const foundDevice = await this.securityDevicesRepository.findById(deviceId);
    if (!foundDevice) {
      throw new NotFoundException('The device was not found');
    }
    return await this.securityDevicesRepository.deleteById(
      foundDevice.deviceId,
    );
  }
}
