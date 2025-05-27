import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CoreConfig } from '../../src/core/core.config';
import { createValidPostModel } from '../models/bloggers-platform/post.input-model';
import { paginationInputParams } from '../models/base/pagination.input-test-dto';
import { PaginationViewTestDto } from '../models/base/pagination.view-test-dto';
import { CreatePostInputTestDto } from '../models/bloggers-platform/input-test-dto/create-post.input-test-dto';
import { UpdatePostInputTestDto } from '../models/bloggers-platform/input-test-dto/update-post.input-test-dto';
import { PostViewTestDto } from '../models/bloggers-platform/view-test-dto/post.view-test-dto';
import { LikeInputTestDTO } from '../models/bloggers-platform/input-test-dto/like.input-test-dto';

export class PostsTestManager {
  constructor(
    private readonly app: INestApplication,
    private readonly coreConfig: CoreConfig,
  ) {}

  async createPost(
    createdModel: CreatePostInputTestDto,
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
    blogId: number,
    count: number,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const posts: PostViewTestDto[] = [];
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

  expectCorrectModel(createdModel: any, responseModel: PostViewTestDto) {
    expect(createdModel.title).toBe(responseModel.title);
    expect(createdModel.shortDescription).toBe(responseModel.shortDescription);
    expect(createdModel.content).toBe(responseModel.content);
    expect(createdModel.blogId).toBe(responseModel.blogId);
  }

  async createPostIsNotAuthorized(
    createdModel: CreatePostInputTestDto,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return request(this.app.getHttpServer())
      .post('/posts')
      .auth('invalid login', 'invalid password')
      .send(createdModel)
      .expect(statusCode);
  }

  async getPostsWithPaging(statusCode: number = HttpStatus.OK) {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      paginationInputParams;
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
    createModels: PostViewTestDto[],
    responseModels: PaginationViewTestDto<PostViewTestDto[]>,
  ) {
    expect(responseModels.items.length).toBe(createModels.length);
    expect(responseModels.totalCount).toBe(createModels.length);
    expect(responseModels.items).toEqual(createModels);
    expect(responseModels.pagesCount).toBe(1);
    expect(responseModels.page).toBe(1);
    expect(responseModels.pageSize).toBe(10);
  }

  async getPostById(id: number, statusCode: number = HttpStatus.OK) {
    const response = await request(this.app.getHttpServer())
      .get('/posts/' + id)
      .expect(statusCode);
    return response.body;
  }

  async updatePost(
    id: number,
    blogId: number,
    updatedModel: UpdatePostInputTestDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    return request(this.app.getHttpServer())
      .put(`/sa/blogs/${blogId}/posts/${id}/`)
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .send(updatedModel)
      .expect(statusCode);
  }

  async updatePostIsNotAuthorized(
    id: number,
    blogId: number,
    updatedModel: UpdatePostInputTestDto,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return request(this.app.getHttpServer())
      .put(`/sa/blogs/${blogId}/posts/${id}/`)
      .auth('invalid login', 'invalid password')
      .send(updatedModel)
      .expect(statusCode);
  }

  async deleteById(
    id: number,
    blogId: number,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    return request(this.app.getHttpServer())
      .delete(`/sa/blogs/${blogId}/posts/${id}/`)
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .expect(statusCode);
  }

  async deleteByIdIsNotAuthorized(
    id: number,
    blogId: number,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return request(this.app.getHttpServer())
      .delete(`/sa/blogs/${blogId}/posts/${id}/`)
      .auth('invalid login', 'invalid password')
      .expect(statusCode);
  }

  async updateLikeStatus(
    accessToken: string,
    postId: number,
    createdModel: LikeInputTestDTO | string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .put(`/posts/${postId}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send(createdModel)
      .expect(statusCode);
  }
}
