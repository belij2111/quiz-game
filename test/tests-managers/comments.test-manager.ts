import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { paginationInputParams } from '../models/base/pagination.input-test-dto';
import { createValidCommentModel } from '../models/bloggers-platform/comment.input-model';
import { CreateCommentInputTestDto } from '../models/bloggers-platform/input-test-dto/create-comment.input-test-dto';
import { UpdateCommentInputTestDto } from '../models/bloggers-platform/input-test-dto/update-comment.input-test-dto';
import { CommentViewTestDto } from '../models/bloggers-platform/view-test-dto/comment.view-test-dto';
import { LikeInputTestDTO } from '../models/bloggers-platform/input-test-dto/like.input-test-dto';

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
      comments.unshift(response.body);
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
    createdModel: LikeInputTestDTO | string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.app.getHttpServer())
      .put(`/comments/${commentId}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send(createdModel)
      .expect(statusCode);
  }
}
