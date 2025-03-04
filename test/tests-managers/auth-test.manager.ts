import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserCreateModel } from '../../src/features/user-accounts/users/api/models/input/create-user.input.model';
import request from 'supertest';
import { LoginInputModel } from '../../src/features/user-accounts/auth/api/models/input/login.input.model';
import { CoreConfig } from '../../src/core/core.config';
import { MeViewModel } from '../../src/features/user-accounts/auth/api/models/view/me.view.model';
import { UserViewModel } from '../../src/features/user-accounts/users/api/models/view/user.view.model';
import { RegistrationEmailResendingModel } from '../../src/features/user-accounts/auth/api/models/input/registration-email-resending.model';
import { RegistrationConfirmationCodeModel } from '../../src/features/user-accounts/auth/api/models/input/registration-confirmation-code.model';
import { PasswordRecoveryInputModel } from '../../src/features/user-accounts/auth/api/models/input/password-recovery-input.model';
import { NewPasswordRecoveryInputModel } from '../../src/features/user-accounts/auth/api/models/input/new-password-recovery-input.model';

export class AuthTestManager {
  constructor(
    private readonly app: INestApplication,
    private readonly coreConfig: CoreConfig,
  ) {}

  async loginUser(
    createdModel: UserCreateModel,
    statusCode: number = HttpStatus.OK,
  ) {
    const loginModel: LoginInputModel = {
      loginOrEmail: createdModel.email,
      password: createdModel.password,
    };
    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'MyCustomUserAgent/1.0')
      .send(loginModel)
      .expect(statusCode);
    if (response.statusCode === HttpStatus.OK) {
      return {
        accessToken: response.body.accessToken,
        refreshToken: response.headers['set-cookie'][0]
          .split('=')[1]
          .split(';')[0],
      };
    }
  }

  expectCorrectLoginUser(responseModel: any) {
    const jwtPattern = /^[A-Za-z0-9\-_.]+$/;
    expect(responseModel.accessToken).toBeDefined();
    expect(responseModel.accessToken).toMatch(jwtPattern);
    expect(responseModel.refreshToken).toBeDefined();
    expect(responseModel.refreshToken).toMatch(jwtPattern);
  }

  async loginWithRateLimit(
    createdModel: UserCreateModel,
    countAttempts: number,
  ): Promise<Array<{ accessToken: string; refreshToken: string } | Error>> {
    const promises: Array<
      Promise<{ accessToken: string; refreshToken: string } | Error>
    > = [];
    for (let i = 0; i < countAttempts; i++) {
      promises.push(this.loginUser(createdModel).catch((err) => err));
    }
    return await Promise.all(promises);
  }

  expectTooManyRequests(responses: (Error | any)[]) {
    const tooManyRequestsResponse = responses.find(
      (response) =>
        response instanceof Error && response.message.includes('429'),
    );
    expect(tooManyRequestsResponse).toBeDefined();
    expect(tooManyRequestsResponse.message).toContain('Too Many Requests');
  }

  async refreshToken(refreshToken: string, statusCode: number = HttpStatus.OK) {
    const response = await request(this.app.getHttpServer())
      .post('/auth/refresh-token')
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(statusCode);
    if (response.statusCode === HttpStatus.OK) {
      return {
        accessToken: response.body.accessToken,
        refreshToken: response.headers['set-cookie'][0]
          .split('=')[1]
          .split(';')[0],
      };
    }
  }

  async me(accessToken: string, statusCode: number = HttpStatus.OK) {
    const response = await request(this.app.getHttpServer())
      .get('/auth/me')
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);
    return response.body;
  }

  expectCorrectMe(createdUser: UserViewModel, createdResponse: MeViewModel) {
    expect(createdUser.login).toBe(createdResponse.login);
    expect(createdUser.email).toBe(createdResponse.email);
    expect(createdUser.id).toBe(createdResponse.userId);
  }

  async registration(
    createdModel: UserCreateModel,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .post('/auth/registration')
      .send(createdModel)
      .expect(statusCode);
  }

  expectCorrectSendEmail(
    sendEmailSpy: jest.SpyInstance,
    validUserModel: UserCreateModel,
    actionType: 'registration' | 'passwordRecovery',
    callCount: number = 1,
  ) {
    expect(sendEmailSpy).toHaveBeenCalled();
    expect(sendEmailSpy).toHaveBeenCalledTimes(callCount);
    expect(sendEmailSpy).toHaveBeenCalledWith(
      validUserModel.email,
      expect.any(String),
      actionType,
    );
  }

  async registrationWithRateLimit(
    createdUsers: UserCreateModel[],
  ): Promise<Array<{ accessToken: string; refreshToken: string } | Error>> {
    const promises: Array<
      Promise<{ accessToken: string; refreshToken: string } | Error>
    > = [];
    for (const user of createdUsers) {
      const registrationPromise = this.registration(user).catch((err) => err);
      promises.push(registrationPromise);
    }
    return await Promise.all(promises);
  }

  async registrationConfirmation(
    createdModel: RegistrationConfirmationCodeModel,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send(createdModel)
      .expect(statusCode);
  }

  async registrationConfirmationWithRateLimit(
    createdModel: RegistrationConfirmationCodeModel,
    countAttempts: number,
  ): Promise<Array<{ accessToken: string; refreshToken: string } | Error>> {
    const promises: Array<
      Promise<{ accessToken: string; refreshToken: string } | Error>
    > = [];
    for (let i = 0; i < countAttempts; i++) {
      promises.push(
        this.registrationConfirmation(createdModel).catch((err) => err),
      );
    }
    return await Promise.all(promises);
  }

  async registrationEmailResending(
    createdModel: RegistrationEmailResendingModel,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send(createdModel)
      .expect(statusCode);
  }

  async registrationEmailResendingWithRateLimit(
    createdModel: RegistrationEmailResendingModel,
    countAttempts: number,
  ): Promise<Array<{ accessToken: string; refreshToken: string } | Error>> {
    const promises: Array<
      Promise<{ accessToken: string; refreshToken: string } | Error>
    > = [];
    for (let i = 0; i < countAttempts; i++) {
      promises.push(
        this.registrationEmailResending(createdModel).catch((err) => err),
      );
    }
    return await Promise.all(promises);
  }

  async passwordRecovery(
    createdModel: PasswordRecoveryInputModel,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .post('/auth/password-recovery')
      .send(createdModel)
      .expect(statusCode);
  }

  async passwordRecoveryWithRateLimit(
    createdModel: RegistrationEmailResendingModel,
    countAttempts: number,
  ): Promise<Array<{ accessToken: string; refreshToken: string } | Error>> {
    const promises: Array<
      Promise<{ accessToken: string; refreshToken: string } | Error>
    > = [];
    for (let i = 0; i < countAttempts; i++) {
      promises.push(this.passwordRecovery(createdModel).catch((err) => err));
    }
    return await Promise.all(promises);
  }

  async newPassword(
    createdModel: NewPasswordRecoveryInputModel,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .post('/auth/new-password')
      .send(createdModel)
      .expect(statusCode);
  }

  async newPasswordWithRateLimit(
    createdModel: NewPasswordRecoveryInputModel,
    countAttempts: number,
  ): Promise<Array<{ accessToken: string; refreshToken: string } | Error>> {
    const promises: Array<
      Promise<{ accessToken: string; refreshToken: string } | Error>
    > = [];
    for (let i = 0; i < countAttempts; i++) {
      promises.push(this.newPassword(createdModel).catch((err) => err));
    }
    return await Promise.all(promises);
  }
}
