import { HttpStatus, INestApplication } from '@nestjs/common';
import { CoreConfig } from '../../src/core/core.config';
import request from 'supertest';
import { paginationInputParams } from '../models/base/pagination.input-test-dto';
import { createValidUserModel } from '../models/user-accounts/user.input-model';
import { CreateUserInputTestDto } from '../models/bloggers-platform/input-test-dto/create-user.input-test-dto';
import { UserViewTestDto } from '../models/bloggers-platform/view-test-dto/user.view-test-dto';
import { PaginationViewTestDto } from '../models/base/pagination.view-test-dto';

export class UsersTestManager {
  constructor(
    private readonly app: INestApplication,
    private readonly coreConfig: CoreConfig,
  ) {}

  async createUser(
    createdModel: CreateUserInputTestDto,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post('/sa/users')
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .send(createdModel)
      .expect(statusCode);
    return response.body;
  }

  expectCorrectModel(
    createdModel: CreateUserInputTestDto,
    responseModel: UserViewTestDto,
  ) {
    expect(createdModel.login).toBe(responseModel.login);
    expect(createdModel.email).toBe(responseModel.email);
  }

  async createUserIsNotAuthorized(
    createdModel: CreateUserInputTestDto,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return request(this.app.getHttpServer())
      .post('/sa/users')
      .auth('invalid login', 'invalid password')
      .send(createdModel)
      .expect(statusCode);
  }

  async createUsers(
    count: number = 1,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const users: UserViewTestDto[] = [];
    for (let i = 1; i <= count; i++) {
      const response = await request(this.app.getHttpServer())
        .post('/sa/users')
        .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
        .send(createValidUserModel(i))
        .expect(statusCode);
      users.push(response.body);
    }
    return users;
  }

  async getUsersWithPaging(statusCode: number = HttpStatus.OK) {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      paginationInputParams;
    const searchLoginTerm = 'user';
    const searchEmailTerm = 'user';
    return request(this.app.getHttpServer())
      .get('/sa/users')
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
    createdModels: UserViewTestDto[],
    responseModels: PaginationViewTestDto<UserViewTestDto[]>,
  ) {
    expect(responseModels.items.length).toBe(createdModels.length);
    expect(responseModels.totalCount).toBe(createdModels.length);
    expect(responseModels.items).toEqual(createdModels);
    expect(responseModels.pagesCount).toBe(1);
    expect(responseModels.page).toBe(1);
    expect(responseModels.pageSize).toBe(10);
  }

  async getUsersIsNotAuthorized(statusCode: number = HttpStatus.UNAUTHORIZED) {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      paginationInputParams;
    const searchLoginTerm = 'user';
    const searchEmailTerm = 'user';
    return request(this.app.getHttpServer())
      .get('/sa/users')
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

  async deleteById(id: string, statusCode: number = HttpStatus.NO_CONTENT) {
    return request(this.app.getHttpServer())
      .delete('/sa/users/' + id)
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .expect(statusCode);
  }

  async deleteByIdIsNotAuthorized(
    id: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return request(this.app.getHttpServer())
      .delete('/sa/users/' + id)
      .auth('invalid login', 'invalid password')
      .expect(statusCode);
  }
}
