import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestManager } from '../../tests-managers/users-test.manager';
import { initSettings } from '../../helpers/init-settings';
import { deleteAllData } from '../../helpers/delete-all-data';
import { UserCreateModel } from '../../../src/features/user-accounts/users/api/models/input/create-user.input.model';
import {
  createInValidUserModel,
  createValidUserModel,
} from '../../models/user-accounts/user.input.model';

describe('e2e-Users', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;
  beforeEach(async () => {
    const result = await initSettings();
    app = result.app;
    const coreConfig = result.coreConfig;
    usersTestManager = new UsersTestManager(app, coreConfig);
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

  describe('POST/users', () => {
    it(`should create new user : STATUS 201`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      const createdResponse = await usersTestManager.createUser(
        validUserModel,
        HttpStatus.CREATED,
      );
      usersTestManager.expectCorrectModel(validUserModel, createdResponse);
    });
    it(`shouldn't create new user with incorrect input data : STATUS 400`, async () => {
      const invalidUserModel: UserCreateModel = createInValidUserModel();
      await usersTestManager.createUser(
        invalidUserModel,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't create new user if the request is unauthorized : STATUS 401`, async () => {
      const validUserModel: UserCreateModel = createValidUserModel();
      await usersTestManager.createUserIsNotAuthorized(
        validUserModel,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe('GET/users', () => {
    it(`should return users with paging : STATUS 200`, async () => {
      const createdUsers = await usersTestManager.createUsers(3);
      const createdResponse = await usersTestManager.getUsersWithPaging(
        HttpStatus.OK,
      );
      usersTestManager.expectCorrectPagination(
        createdUsers,
        createdResponse.body,
      );
      // console.log(createdResponse.body);
    });
    it(`shouldn't return users with paging if the request is unauthorized : STATUS 401`, async () => {
      await usersTestManager.createUsers(3);
      await usersTestManager.getUsersIsNotAuthorized(HttpStatus.UNAUTHORIZED);
    });
  });
});
