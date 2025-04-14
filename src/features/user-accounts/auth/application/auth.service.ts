import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CryptoService } from '../../crypto/crypto.service';
import { LoginInputModel } from '../api/models/input/login.input.model';
import { User } from '../../users/domain/user.sql.entity';
import { UserCreateModel } from '../../users/api/models/input/create-user.input.model';
import { UuidProvider } from '../../../../core/helpers/uuid.provider';
import { MailService } from '../../../notifications/mail.service';
import { RegistrationConfirmationCodeModel } from '../api/models/input/registration-confirmation-code.model';
import { RegistrationEmailResendingModel } from '../api/models/input/registration-email-resending.model';
import { PasswordRecoveryInputModel } from '../api/models/input/password-recovery-input.model';
import { NewPasswordRecoveryInputModel } from '../api/models/input/new-password-recovery-input.model';
import { UserAccountConfig } from '../../config/user-account.config';
import { UsersSqlRepository } from '../../users/infrastructure/users.sql.repository';
import { SecurityDevicesSqlRepository } from '../../security-devices/infrastructure/security-devices.sql.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly bcryptService: CryptoService,
    private readonly userAccountConfig: UserAccountConfig,
    private readonly uuidProvider: UuidProvider,
    private readonly mailService: MailService,
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
      id: this.uuidProvider.generate(),
      login: userCreateModel.login,
      password: passHash,
      email: userCreateModel.email,
      createdAt: new Date(),
      confirmationCode: this.uuidProvider.generate(),
      expirationDate: new Date(new Date().getTime() + expirationTime),
      isConfirmed: false,
    };
    await this.usersSqlRepository.create(newUser);
    this.mailService.sendEmail(
      newUser.email,
      newUser.confirmationCode,
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
