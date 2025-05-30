import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { paginationInputParams } from '../models/base/pagination.input-test-dto';

export class BlogsPublicTestManager {
  constructor(private readonly app: INestApplication) {}

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

  async getBlogById(id: number, statusCode: number = HttpStatus.NOT_FOUND) {
    const response = await request(this.app.getHttpServer())
      .get('/blogs/' + id)
      .expect(statusCode);
    return response.body;
  }
}
