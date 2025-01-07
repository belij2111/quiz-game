import { HttpStatus, INestApplication } from '@nestjs/common';
import { CoreConfig } from '../../src/core/core.config';
import request from 'supertest';
import { UserCreateModel } from '../../src/features/user-accounts/users/api/models/input/create-user.input.model';
import { UserViewModel } from '../../src/features/user-accounts/users/api/models/view/user.view.model';

export class UsersTestManager {
  constructor(
    private readonly app: INestApplication,
    private readonly coreConfig: CoreConfig,
  ) {}

  async createUser(
    createdModel: UserCreateModel,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post('/users')
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .send(createdModel)
      .expect(statusCode);
    return response.body;
  }

  expectCorrectModel(
    createdModel: UserCreateModel,
    responseModel: UserViewModel,
  ) {
    expect(createdModel.login).toBe(responseModel.login);
    expect(createdModel.email).toBe(responseModel.email);
  }

  async createUserIsNotAuthorized(
    createdModel: UserCreateModel,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return request(this.app.getHttpServer())
      .post('/users')
      .auth('invalid login', 'invalid password')
      .send(createdModel)
      .expect(statusCode);
  }
}
