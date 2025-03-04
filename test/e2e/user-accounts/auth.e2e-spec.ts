import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestManager } from '../../tests-managers/users-test.manager';
import { initSettings } from '../../helpers/init-settings';
import { deleteAllData } from '../../helpers/delete-all-data';
import { UserCreateModel } from '../../../src/features/user-accounts/users/api/models/input/create-user.input.model';
import {
  createInValidUserModel,
  createSeveralUsersModels,
  createValidUserModel,
} from '../../models/user-accounts/user.input.model';
import { AuthTestManager } from '../../tests-managers/auth-test.manager';
import { delay } from '../../helpers/delay';
import { MailService } from '../../../src/features/notifications/mail.service';
import { MailServiceMock } from '../../mock/mail.service.mock';
import {
  createEmailResendingInputModel,
  createInvalidEmailResendingInputModel,
} from '../../models/user-accounts/email.resending.input.model';
import {
  createInvalidRegistrationConfirmationCodeInputModel,
  createRegistrationConfirmationCodeInputModel,
} from '../../models/user-accounts/registration.confirmation.code.input.model';

describe('e2e-Auth', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;
  let authTestManager: AuthTestManager;
  let mailServiceMock: MailServiceMock;
  beforeEach(async () => {
    const result = await initSettings(MailService, MailServiceMock);
    app = result.app;
    const coreConfig = result.coreConfig;
    usersTestManager = new UsersTestManager(app, coreConfig);
    authTestManager = new AuthTestManager(app, coreConfig);
    mailServiceMock = app.get(MailService);
  });
  beforeEach(async () => {
    await deleteAllData(app);
  });
  afterEach(async () => {
    await deleteAllData(app);
  });
  afterAll(async () => {
    await app.close();
  });
  describe('POST/auth/login', () => {
    it(`should login user to the system : STATUS 200`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      await usersTestManager.createUser(validUserModel);
      const createdResponse = await authTestManager.loginUser(
        validUserModel,
        HttpStatus.OK,
      );
      // console.log('createdResponse.accessToken :', createdResponse.accessToken);
      // console.log('createdResponse.refreshToken :', createdResponse.refreshToken);
      authTestManager.expectCorrectLoginUser(createdResponse);
    });
    it(`shouldn't login user to the system if the password or login is wrong : STATUS 401`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      await usersTestManager.createUser(validUserModel);
      const invalidUserModel: UserCreateModel = createInValidUserModel();
      await authTestManager.loginUser(
        invalidUserModel,
        HttpStatus.UNAUTHORIZED,
      );
    });

    it(`should restrict login if the limit is exceeded : STATUS 429`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      await usersTestManager.createUser(validUserModel);
      const createdResponse = await authTestManager.loginWithRateLimit(
        validUserModel,
        6,
      );
      // console.log('createdResponse :', createdResponse);
      authTestManager.expectTooManyRequests(createdResponse);
    });
  });

  describe('POST/auth/refresh-token', () => {
    it(`should generate a new pair of tokens : STATUS 200`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      await usersTestManager.createUser(validUserModel);
      const loginResult = await authTestManager.loginUser(validUserModel);
      const createdResponse = await authTestManager.refreshToken(
        loginResult!.refreshToken,
        HttpStatus.OK,
      );
      // console.log('createdResponse.accessToken :', createdResponse.accessToken);
      // console.log('createdResponse.refreshToken :', createdResponse.refreshToken);
      authTestManager.expectCorrectLoginUser(createdResponse);
    });
    it(`shouldn't generate a new pair of tokens if refreshToken expired : STATUS 401`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      await usersTestManager.createUser(validUserModel);
      const loginResult = await authTestManager.loginUser(validUserModel);
      await delay(20000);
      await authTestManager.refreshToken(
        loginResult!.refreshToken,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe('GET/auth/me', () => {
    it(`should return users info with correct accessTokens : STATUS 200`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      const createdUser = await usersTestManager.createUser(validUserModel);
      const loginResult = await authTestManager.loginUser(validUserModel);
      const createdResponse = await authTestManager.me(
        loginResult!.accessToken,
        HttpStatus.OK,
      );
      // console.log('createdResponse :', createdResponse);
      authTestManager.expectCorrectMe(createdUser, createdResponse);
    });
    it(`shouldn't return users info with if accessTokens expired : STATUS 401`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      await usersTestManager.createUser(validUserModel);
      const loginResult = await authTestManager.loginUser(validUserModel);
      await delay(10000);
      await authTestManager.me(
        loginResult!.accessToken,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe('POST/auth/registration', () => {
    it(`should register user in system : STATUS 204`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      const sendEmailSpy = jest.spyOn(mailServiceMock, 'sendEmail');
      await authTestManager.registration(validUserModel, HttpStatus.NO_CONTENT);
      authTestManager.expectCorrectRegistration(sendEmailSpy, validUserModel);
    });
    it(`shouldn't register user in system with incorrect input data : STATUS 400`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel(7);
      await usersTestManager.createUser(validUserModel);
      await authTestManager.registration(
        validUserModel,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't register user in system if the limit is exceeded : STATUS 429`, async () => {
      const createdUsersModels: UserCreateModel[] = createSeveralUsersModels(6);
      const createdResponse =
        await authTestManager.registrationWithRateLimit(createdUsersModels);
      // console.log('createdResponse : ', createdResponse);
      authTestManager.expectTooManyRequests(createdResponse);
    });
  });

  describe('POST/auth/registration-confirmation', () => {
    it(`should confirm the user's registration in system : STATUS 204`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      await authTestManager.registration(validUserModel, HttpStatus.NO_CONTENT);
      const confirmationCode = mailServiceMock.sentEmails[0]?.code;
      const confirmationCodeModel =
        createRegistrationConfirmationCodeInputModel(confirmationCode);
      // console.log('mailServiceMock.sentEmails :', mailServiceMock.sentEmails);
      await authTestManager.registrationConfirmation(
        confirmationCodeModel,
        HttpStatus.NO_CONTENT,
      );
    });
    it(`shouldn't confirm the user's registration with incorrect input data : STATUS 400`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      await authTestManager.registration(validUserModel, HttpStatus.NO_CONTENT);
      const invalidConfirmationCode =
        createInvalidRegistrationConfirmationCodeInputModel();
      await authTestManager.registrationConfirmation(
        invalidConfirmationCode,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't confirm the user's registration if the limit is exceeded : STATUS 429`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      await authTestManager.registration(validUserModel, HttpStatus.NO_CONTENT);
      const confirmationCode = mailServiceMock.sentEmails[0]?.code;
      const confirmationCodeModel =
        createRegistrationConfirmationCodeInputModel(confirmationCode);
      const createdResponse =
        await authTestManager.registrationConfirmationWithRateLimit(
          confirmationCodeModel,
          6,
        );
      authTestManager.expectTooManyRequests(createdResponse);
    });
  });

  describe('POST/auth/registration-email-resending', () => {
    it(`should resend confirmation registration by email : STATUS 204`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      const sendEmailSpy = jest.spyOn(mailServiceMock, 'sendEmail');
      await authTestManager.registration(validUserModel);
      const emailResendingModel =
        createEmailResendingInputModel(validUserModel);
      await authTestManager.registrationEmailResending(
        emailResendingModel,
        HttpStatus.NO_CONTENT,
      );
      authTestManager.expectCorrectRegistration(
        sendEmailSpy,
        validUserModel,
        2,
      );
    });
    it(`shouldn't resend confirmation registration with incorrect input data : STATUS 400 `, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      await authTestManager.registration(validUserModel, HttpStatus.NO_CONTENT);
      const invalidEmailResendingModel =
        createInvalidEmailResendingInputModel();
      await authTestManager.registrationEmailResending(
        invalidEmailResendingModel,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't resend confirmation registration if the limit is exceeded : STATUS 429`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      await authTestManager.registration(validUserModel);
      const emailResendingModel =
        createEmailResendingInputModel(validUserModel);
      const createdResponse =
        await authTestManager.registrationEmailResendingWithRateLimit(
          emailResendingModel,
          6,
        );
      authTestManager.expectTooManyRequests(createdResponse);
    });
  });
});
