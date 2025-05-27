import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { paginationInputParams } from '../models/base/pagination.input-test-dto';
import { createValidCommentModel } from '../models/bloggers-platform/comment.input-model';
import { LikeInputModel } from '../../src/features/bloggers-platform/likes/api/models/input/like.input-model';
import { PaginationViewTestDto } from '../models/base/pagination.view-test-dto';
import { CreateCommentInputTestDto } from '../models/bloggers-platform/input-test-dto/create-comment.input-test-dto';
import { UpdateCommentInputTestDto } from '../models/bloggers-platform/input-test-dto/update-comment.input-test-dto';
import { CommentViewTestDto } from '../models/bloggers-platform/view-test-dto/comment.view-test-dto';

export class CommentsTestManager {
  constructor(private readonly app: INestApplication) {}

  async createComment(
    accessToken: string,
    postId: number,
    createdModel: CreateCommentInputTestDto,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .auth(accessToken, { type: 'bearer' })
      .send(createdModel)
      .expect(statusCode);
    return response.body;
  }

  expectCorrectModel(
    createdModel: CreateCommentInputTestDto,
    responseModel: CommentViewTestDto,
  ) {
    expect(createdModel.content).toBe(responseModel.content);
  }

  async createComments(
    accessToken: string,
    postId: number,
    count: number,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const comments: CommentViewTestDto[] = [];
    for (let i = 1; i <= count; i++) {
      const response = await request(this.app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .auth(accessToken, { type: 'bearer' })
        .send(createValidCommentModel(i))
        .expect(statusCode);
      comments.push(response.body);
    }
    return comments;
  }

  async getCommentsWithPaging(
    postId: number,
    statusCode: number = HttpStatus.OK,
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      paginationInputParams;
    return request(this.app.getHttpServer())
      .get(`/posts/${postId}/comments`)
      .query({
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      })
      .expect(statusCode);
  }

  expectCorrectPagination(
    createModels: CreateCommentInputTestDto[],
    responseModels: PaginationViewTestDto<CommentViewTestDto[]>,
  ) {
    expect(responseModels.items.length).toBe(createModels.length);
    expect(responseModels.totalCount).toBe(createModels.length);
    expect(responseModels.items).toEqual(createModels);
    expect(responseModels.pagesCount).toBe(1);
    expect(responseModels.page).toBe(1);
    expect(responseModels.pageSize).toBe(10);
  }

  async getCommentById(id: number, statusCode: number = HttpStatus.OK) {
    const response = await request(this.app.getHttpServer())
      .get('/comments/' + id)
      .expect(statusCode);
    return response.body;
  }

  async update(
    accessToken: string,
    commentId: number,
    updatedModel: UpdateCommentInputTestDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .put(`/comments/${commentId}`)
      .auth(accessToken, { type: 'bearer' })
      .send(updatedModel)
      .expect(statusCode);
  }

  async delete(
    accessToken: string,
    commentId: number,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .delete(`/comments/${commentId}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);
  }

  async updateLikeStatus(
    accessToken: string,
    commentId: number,
    createdModel: LikeInputModel | string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .put(`/comments/${commentId}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send(createdModel)
      .expect(statusCode);
  }
}
