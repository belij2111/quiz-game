import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CoreConfig } from '../../src/core/core.config';
import { paginationInputParams } from '../models/base/pagination.input-test-dto';
import { PaginationViewTestDto } from '../models/base/pagination.view-test-dto';
import { PostViewTestDto } from '../models/bloggers-platform/view-test-dto/post.view-test-dto';
import { LikeInputTestDTO } from '../models/bloggers-platform/input-test-dto/like.input-test-dto';
import { CreatePostInputTestDto } from '../models/bloggers-platform/input-test-dto/create-post.input-test-dto';

export class PostsTestManager {
  constructor(
    private readonly app: INestApplication,
    private readonly coreConfig: CoreConfig,
  ) {}

  expectCorrectModel(
    createdModel: CreatePostInputTestDto,
    responseModel: PostViewTestDto,
  ) {
    expect(createdModel.title).toBe(responseModel.title);
    expect(createdModel.shortDescription).toBe(responseModel.shortDescription);
    expect(createdModel.content).toBe(responseModel.content);
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
