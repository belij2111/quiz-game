import { HttpStatus, INestApplication } from '@nestjs/common';
import { CoreConfig } from '../../src/core/core.config';
import request from 'supertest';
import { UserCreateModel } from '../../src/features/user-accounts/users/api/models/input/create-user.input.model';
import { UserViewModel } from '../../src/features/user-accounts/users/api/models/view/user.view.model';
import { paginationParams } from '../models/base/pagination.model';
import { Paginator } from '../../src/core/models/pagination.base.model';
import { createValidUserModel } from '../models/user-accounts/user.input.model';

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

  async createUsers(
    count: number = 1,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const users: UserViewModel[] = [];
    for (let i = 1; i <= count; i++) {
      const response = await request(this.app.getHttpServer())
        .post('/users')
        .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
        .send(createValidUserModel(i))
        .expect(statusCode);
      users.push(response.body);
    }
    return users;
  }

  async getUsersWithPaging(statusCode: number = HttpStatus.OK) {
    const { pageNumber, pageSize, sortBy, sortDirection } = paginationParams;
    const searchLoginTerm = 'user';
    const searchEmailTerm = 'user';
    return request(this.app.getHttpServer())
      .get('/users')
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .query({
        searchLoginTerm,
        searchEmailTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      })
      .expect(statusCode);
  }

  expectCorrectPagination(
    createdModels: UserViewModel[],
    responseModels: Paginator<UserViewModel[]>,
  ) {
    expect(responseModels.items.length).toBe(createdModels.length);
    expect(responseModels.totalCount).toBe(createdModels.length);
    expect(responseModels.items).toEqual(createdModels);
    expect(responseModels.pagesCount).toBe(1);
    expect(responseModels.page).toBe(1);
    expect(responseModels.pageSize).toBe(10);
  }

  async getUsersIsNotAuthorized(statusCode: number = HttpStatus.UNAUTHORIZED) {
    const { pageNumber, pageSize, sortBy, sortDirection } = paginationParams;
    const searchLoginTerm = 'user';
    const searchEmailTerm = 'user';
    return request(this.app.getHttpServer())
      .get('/users')
      .auth('invalid login', 'invalid password')
      .query({
        searchLoginTerm,
        searchEmailTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      })
      .expect(statusCode);
  }
}
