import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { paginationInputParams } from '../models/base/pagination.input-test-dto';
import { createValidBlogModel } from '../models/bloggers-platform/blog.input-model';
import { CoreConfig } from '../../src/core/core.config';
import { CreatePostInputModel } from '../../src/features/bloggers-platform/posts/api/models/input/create-post.input-model';
import { PaginationViewTestDto } from '../models/base/pagination.view-test-dto';
import { CreateBlogInputTestDto } from '../models/bloggers-platform/input-test-dto/create-blog.input-test-dto';
import { UpdateBlogInputTestDto } from '../models/bloggers-platform/input-test-dto/update-blog.input-test-dto';
import { BlogViewTestDto } from '../models/bloggers-platform/view-test-dto/blog.view-test-dto';

export class BlogsTestManager {
  constructor(
    private readonly app: INestApplication,
    private readonly coreConfig: CoreConfig,
  ) {}

  async createBlog(
    createdModel: CreateBlogInputTestDto,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post('/sa/blogs')
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .send(createdModel)
      .expect(statusCode);
    return response.body;
  }

  expectCorrectModel(
    createdModel: CreateBlogInputTestDto,
    responseModel: BlogViewTestDto,
  ) {
    expect(createdModel.name).toBe(responseModel.name);
    expect(createdModel.description).toBe(responseModel.description);
    expect(createdModel.websiteUrl).toBe(responseModel.websiteUrl);
  }

  async createBlogs(
    count: number = 1,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const blogs: BlogViewTestDto[] = [];
    for (let i = 1; i <= count; i++) {
      const response = await request(this.app.getHttpServer())
        .post('/sa/blogs')
        .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
        .send(createValidBlogModel(i))
        .expect(statusCode);
      blogs.push(response.body);
    }
    return blogs;
  }

  async getBlogsWithPaging(statusCode: number = HttpStatus.OK) {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      paginationInputParams;
    const searchNameTerm = 'Blog';
    return request(this.app.getHttpServer())
      .get('/blogs')
      .query({
        searchNameTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      })
      .expect(statusCode);
  }

  expectCorrectPagination(
    createdModels: BlogViewTestDto[],
    responseModels: PaginationViewTestDto<BlogViewTestDto[]>,
  ) {
    expect(responseModels.items.length).toBe(createdModels.length);
    expect(responseModels.totalCount).toBe(createdModels.length);
    expect(responseModels.items).toEqual(createdModels);
    expect(responseModels.pagesCount).toBe(1);
    expect(responseModels.page).toBe(1);
    expect(responseModels.pageSize).toBe(10);
  }

  async createBlogIsNotAuthorized(
    createdModel: CreateBlogInputTestDto,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return request(this.app.getHttpServer())
      .post('/sa/blogs')
      .auth('invalid login', 'invalid password')
      .send(createdModel)
      .expect(statusCode);
  }

  async getBlogById(id: number, statusCode: number = HttpStatus.NOT_FOUND) {
    const response = await request(this.app.getHttpServer())
      .get('/blogs/' + id)
      .expect(statusCode);
    return response.body;
  }

  async updateBlog(
    id: number,
    updatedModel: UpdateBlogInputTestDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    return request(this.app.getHttpServer())
      .put('/sa/blogs/' + id)
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .send(updatedModel)
      .expect(statusCode);
  }

  async updateBlogIsNotAuthorized(
    id: number,
    updatedModel: UpdateBlogInputTestDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    return request(this.app.getHttpServer())
      .put('/sa/blogs/' + id)
      .auth('invalid login', 'invalid password')
      .send(updatedModel)
      .expect(statusCode);
  }

  async deleteById(id: number, statusCode: number = HttpStatus.NO_CONTENT) {
    return request(this.app.getHttpServer())
      .delete('/sa/blogs/' + id)
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .expect(statusCode);
  }

  async deleteByIdIsNotAuthorized(
    id: number,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return request(this.app.getHttpServer())
      .delete('/sa/blogs/' + id)
      .auth('invalid login', 'invalid password')
      .expect(statusCode);
  }

  async createPostByBlogId(
    blogId: number,
    createdModel: CreatePostInputModel,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/sa/blogs/${blogId}/posts`)
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .send(createdModel)
      .expect(statusCode);
    return response.body;
  }

  async createPostByBlogIdIsNotAuthorized(
    blogId: number,
    createdModel: CreatePostInputModel,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/sa/blogs/${blogId}/posts`)
      .auth('invalid login', 'invalid password')
      .send(createdModel)
      .expect(statusCode);
    return response.body;
  }

  async getPostsByBlogId(blogId: number, statusCode: number = HttpStatus.OK) {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      paginationInputParams;
    return request(this.app.getHttpServer())
      .get(`/blogs/${blogId}/posts`)
      .query({
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      })
      .expect(statusCode);
  }
}
