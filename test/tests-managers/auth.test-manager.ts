import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CoreConfig } from '../../src/core/core.config';
import { CreateUserInputTestDto } from '../models/user-accounts/input-test-dto/create-user.input-test-dto';
import { UserViewTestDto } from '../models/user-accounts/view-test-dto/user.view-test-dto';
import { MeViewTestDto } from '../models/user-accounts/view-test-dto/me.view-test-dto';
import { LoginInputTestDto } from '../models/user-accounts/input-test-dto/login.input-test-dto';
import { RegistrationEmailResendingInputTestDto } from '../models/user-accounts/input-test-dto/registration-email-resending.input-test-dto';
import { PasswordRecoveryInputTestDto } from '../models/user-accounts/input-test-dto/password-recovery.input-test-dto';
import { NewPasswordRecoveryInputTestDto } from '../models/user-accounts/input-test-dto/new-password-recovery.input-test-dto';
import { RegistrationConfirmationCodeInputTestDto } from '../models/user-accounts/input-test-dto/registration-confirmation-code.input-test-dto';
import { LoginSuccessViewTestDto } from '../models/user-accounts/view-test-dto/login-success.view-test-dto';

export class AuthTestManager {
  constructor(
    private readonly app: INestApplication,
    private readonly coreConfig: CoreConfig,
  ) {}

  async loginUser(
    createdModel: CreateUserInputTestDto,
    statusCode: number = HttpStatus.OK,
  ): Promise<LoginSuccessViewTestDto | undefined> {
    const loginModel: LoginInputTestDto = {
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
    createdModel: CreateUserInputTestDto,
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

  expectCorrectMe(
    createdUser: UserViewTestDto,
    createdResponse: MeViewTestDto,
  ) {
    expect(createdUser.login).toBe(createdResponse.login);
    expect(createdUser.email).toBe(createdResponse.email);
    expect(createdUser.id).toBe(createdResponse.userId);
  }

  async registration(
    createdModel: CreateUserInputTestDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .post('/auth/registration')
      .send(createdModel)
      .expect(statusCode);
  }

  expectCorrectSendEmail(
    sendEmailSpy: jest.SpyInstance,
    validUserModel: CreateUserInputTestDto,
    callCount: number = 1,
  ) {
    expect(sendEmailSpy).toHaveBeenCalled();
    expect(sendEmailSpy).toHaveBeenCalledTimes(callCount);
    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: validUserModel.email,
        code: expect.any(String),
      }),
    );
  }

  async registrationWithRateLimit(
    createdUsers: CreateUserInputTestDto[],
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
    createdModel: RegistrationConfirmationCodeInputTestDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send(createdModel)
      .expect(statusCode);
  }

  async registrationConfirmationWithRateLimit(
    createdModel: RegistrationConfirmationCodeInputTestDto,
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
    createdModel: RegistrationEmailResendingInputTestDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send(createdModel)
      .expect(statusCode);
  }

  async registrationEmailResendingWithRateLimit(
    createdModel: RegistrationEmailResendingInputTestDto,
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
    createdModel: PasswordRecoveryInputTestDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .post('/auth/password-recovery')
      .send(createdModel)
      .expect(statusCode);
  }

  async passwordRecoveryWithRateLimit(
    createdModel: RegistrationEmailResendingInputTestDto,
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
    createdModel: NewPasswordRecoveryInputTestDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .post('/auth/new-password')
      .send(createdModel)
      .expect(statusCode);
  }

  async newPasswordWithRateLimit(
    createdModel: NewPasswordRecoveryInputTestDto,
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

  async logout(
    refreshToken: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(statusCode);
  }
}
