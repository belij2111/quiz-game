import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { paginationInputParams } from '../models/base/pagination.input-test-dto';
import { createValidBlogModel } from '../models/bloggers-platform/blog.input-model';
import { CoreConfig } from '../../src/core/core.config';
import { CreateBlogInputTestDto } from '../models/bloggers-platform/input-test-dto/create-blog.input-test-dto';
import { UpdateBlogInputTestDto } from '../models/bloggers-platform/input-test-dto/update-blog.input-test-dto';
import { BlogViewTestDto } from '../models/bloggers-platform/view-test-dto/blog.view-test-dto';
import { CreatePostInputTestDto } from '../models/bloggers-platform/input-test-dto/create-post.input-test-dto';
import { PostViewTestDto } from '../models/bloggers-platform/view-test-dto/post.view-test-dto';
import { createValidPostModel } from '../models/bloggers-platform/post.input-model';
import { UpdatePostInputTestDto } from '../models/bloggers-platform/input-test-dto/update-post.input-test-dto';

export class BlogsAdminTestManager {
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
      .get('/sa/blogs')
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .query({
        searchNameTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      })
      .expect(statusCode);
  }

  async getBlogsByName(blogsCount: number, statusCode: number = HttpStatus.OK) {
    const { pageNumber, sortBy, sortDirection } = paginationInputParams;
    const pageSize = blogsCount;
    const searchNameTerm = 'Blog1';
    return request(this.app.getHttpServer())
      .get('/sa/blogs')
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .query({
        searchNameTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      })
      .expect(statusCode);
  }

  async getBlogsIsNotAuthorized(statusCode: number = HttpStatus.UNAUTHORIZED) {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      paginationInputParams;
    const searchNameTerm = 'Blog';
    return request(this.app.getHttpServer())
      .get('/sa/blogs')
      .auth('invalid login', 'invalid password')
      .query({
        searchNameTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      })
      .expect(statusCode);
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
    createdModel: CreatePostInputTestDto,
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
    createdModel: CreatePostInputTestDto,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/sa/blogs/${blogId}/posts`)
      .auth('invalid login', 'invalid password')
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
        .post(`/sa/blogs/${blogId}/posts`)
        .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
        .send(createValidPostModel(i))
        .expect(statusCode);
      posts.push(response.body);
    }
    return posts;
  }

  async getPostsByBlogId(blogId: number, statusCode: number = HttpStatus.OK) {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      paginationInputParams;
    return request(this.app.getHttpServer())
      .get(`/sa/blogs/${blogId}/posts`)
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .query({
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      })
      .expect(statusCode);
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

  async deletePostById(
    id: number,
    blogId: number,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    return request(this.app.getHttpServer())
      .delete(`/sa/blogs/${blogId}/posts/${id}/`)
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .expect(statusCode);
  }

  async deletePostByIdIsNotAuthorized(
    id: number,
    blogId: number,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return request(this.app.getHttpServer())
      .delete(`/sa/blogs/${blogId}/posts/${id}/`)
      .auth('invalid login', 'invalid password')
      .expect(statusCode);
  }
}
