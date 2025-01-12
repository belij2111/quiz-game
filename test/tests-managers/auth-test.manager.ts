import { HttpStatus, INestApplication } from '@nestjs/common';
import { CoreConfig } from '../../src/core/core.config';
import { UserCreateModel } from '../../src/features/user-accounts/users/api/models/input/create-user.input.model';
import request from 'supertest';
import { LoginInputModel } from '../../src/features/user-accounts/auth/api/models/input/login.input.model';

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
      loginOrEmail: createdModel.login,
      password: createdModel.password,
    };
    return await request(this.app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'MyCustomUserAgent/1.0')
      .send(loginModel)
      .expect(statusCode);
  }

  expectCorrectLoginUser(responseModel: any) {
    const jwtPattern = /^[A-Za-z0-9\-_.]+$/;
    expect(responseModel.body.accessToken).toBeDefined();
    expect(responseModel.body.accessToken).toMatch(jwtPattern);
    expect(responseModel.headers['set-cookie']).toBeDefined();
  }
}
