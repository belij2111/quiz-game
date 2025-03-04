import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CoreConfig } from '../../src/core/core.config';
import { PostCreateModel } from '../../src/features/bloggers-platform/posts/api/models/input/create-post.input.model';
import { PostViewModel } from '../../src/features/bloggers-platform/posts/api/models/view/post.view.model';
import { createValidPostModel } from '../models/bloggers-platform/post.input.model';
import { paginationParams } from '../models/base/pagination.model';
import { Paginator } from '../../src/core/models/pagination.base.model';
import { LikeInputModel } from '../../src/features/bloggers-platform/likes/api/models/input/like.input.model';

export class PostsTestManager {
  constructor(
    private readonly app: INestApplication,
    private readonly coreConfig: CoreConfig,
  ) {}

  async createPost(
    createdModel: PostCreateModel,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post('/posts')
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .send(createdModel)
      .expect(statusCode);
    return response.body;
  }

  async createPosts(
    blogId: string,
    count: number,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const posts: PostViewModel[] = [];
    for (let i = 1; i <= count; i++) {
      const response = await request(this.app.getHttpServer())
        .post('/posts')
        .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
        .send(createValidPostModel(blogId, i))
        .expect(statusCode);
      posts.push(response.body);
    }
    return posts;
  }

  expectCorrectModel(
    createdModel: PostCreateModel,
    responseModel: PostViewModel,
  ) {
    expect(createdModel.title).toBe(responseModel.title);
    expect(createdModel.shortDescription).toBe(responseModel.shortDescription);
    expect(createdModel.content).toBe(responseModel.content);
    expect(createdModel.blogId).toBe(responseModel.blogId);
  }

  async createPostIsNotAuthorized(
    createdModel: PostCreateModel,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return request(this.app.getHttpServer())
      .post('/posts')
      .auth('invalid login', 'invalid password')
      .send(createdModel)
      .expect(statusCode);
  }

  async getPostsWithPaging(statusCode: number = HttpStatus.OK) {
    const { pageNumber, pageSize, sortBy, sortDirection } = paginationParams;
    return request(this.app.getHttpServer())
      .get('/posts')
      .query({
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      })
      .expect(statusCode);
  }

  expectCorrectPagination(
    createModels: PostViewModel[],
    responseModels: Paginator<PostViewModel[]>,
  ) {
    expect(responseModels.items.length).toBe(createModels.length);
    expect(responseModels.totalCount).toBe(createModels.length);
    expect(responseModels.items).toEqual(createModels);
    expect(responseModels.pagesCount).toBe(1);
    expect(responseModels.page).toBe(1);
    expect(responseModels.pageSize).toBe(10);
  }

  async getPostById(id: string, statusCode: number = HttpStatus.OK) {
    const response = await request(this.app.getHttpServer())
      .get('/posts/' + id)
      .expect(statusCode);
    return response.body;
  }

  async updatePost(
    id: string,
    createdModel: PostCreateModel,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    return request(this.app.getHttpServer())
      .put('/posts/' + id)
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .send(createdModel)
      .expect(statusCode);
  }

  async updatePostIsNotAuthorized(
    id: string,
    createdModel: PostCreateModel,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return request(this.app.getHttpServer())
      .put('/posts/' + id)
      .auth('invalid login', 'invalid password')
      .send(createdModel)
      .expect(statusCode);
  }

  async deleteById(id: string, statusCode: number = HttpStatus.NO_CONTENT) {
    return request(this.app.getHttpServer())
      .delete('/posts/' + id)
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .expect(statusCode);
  }

  async deleteByIdIsNotAuthorized(
    id: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return request(this.app.getHttpServer())
      .delete('/posts/' + id)
      .auth('invalid login', 'invalid password')
      .expect(statusCode);
  }

  async updateLikeStatus(
    accessToken: string,
    postId: string,
    createdModel: LikeInputModel | string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .put(`/posts/${postId}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send(createdModel)
      .expect(statusCode);
  }
}
