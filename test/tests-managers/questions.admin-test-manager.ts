import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CoreConfig } from '../../src/core/core.config';
import { CreateQuestionInputDto } from '../../src/features/quiz-game/questions/api/input-dto/create-question.input-dto';
import { QuestionViewDto } from '../../src/features/quiz-game/questions/api/view-dto/question.view-dto';
import {
  createValidQuestionDto,
  QUESTIONS_PULL,
} from '../models/quiz-game/question.input-dto';
import { paginationInputParams } from '../models/base/pagination.input-test-dto';
import { PublishedStatus } from '../../src/features/quiz-game/questions/api/enums/published-status.enum';
import { UpdateQuestionInputDto } from '../../src/features/quiz-game/questions/api/input-dto/update-question.input-dto';
import { UpdatePublishInputDto } from '../../src/features/quiz-game/questions/api/input-dto/update-publish.input-dto';

const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

export class QuestionsAdminTestManager {
  constructor(
    private readonly app: INestApplication,
    private readonly coreConfig: CoreConfig,
  ) {}

  async create(
    createdDto: CreateQuestionInputDto,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post('/sa/quiz/questions')
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .send(createdDto)
      .expect(statusCode);
    return response.body;
  }

  expectCorrectDto(
    createdModel: CreateQuestionInputDto,
    responseModel: QuestionViewDto,
  ) {
    expect(createdModel.body).toBe(responseModel.body);
    expect(createdModel.correctAnswers).toStrictEqual(
      responseModel.correctAnswers,
    );
    expect(responseModel.published).toBe(false);
    expect(responseModel.createdAt).toMatch(ISO_REGEX);
    expect(responseModel.updatedAt).toMatch(ISO_REGEX);
  }

  async createIsNotAuthorized(
    validQuestionDto: CreateQuestionInputDto,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return request(this.app.getHttpServer())
      .post('/sa/quiz/questions')
      .auth('invalid login', 'invalid password')
      .send(validQuestionDto)
      .expect(statusCode);
  }

  async createQuestions(
    count: number = 1,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const questions: QuestionViewDto[] = [];
    for (let i = 0; i < count; i++) {
      const response = await request(this.app.getHttpServer())
        .post('/sa/quiz/questions')
        .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
        .send(createValidQuestionDto(i))
        .expect(statusCode);
      questions.push(response.body);
    }
    return questions;
  }

  async getQuestionsWithPaging(statusCode: number = HttpStatus.OK) {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      paginationInputParams;
    const bodySearchTerm = QUESTIONS_PULL[0].body.split(' ')[0];
    // console.log('bodySearchTerm :', bodySearchTerm);
    const publishedStatus = PublishedStatus.ALL;
    return request(this.app.getHttpServer())
      .get('/sa/quiz/questions')
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .query({
        bodySearchTerm,
        publishedStatus,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      })
      .expect(statusCode);
  }

  async getQuestionsIsNotAuthorized(
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      paginationInputParams;
    const bodySearchTerm = QUESTIONS_PULL[0].body.split(' ')[0];
    const publishedStatus = PublishedStatus.ALL;
    return request(this.app.getHttpServer())
      .get('/sa/quiz/questions')
      .auth('invalid login', 'invalid password')
      .query({
        bodySearchTerm,
        publishedStatus,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      })
      .expect(statusCode);
  }

  async update(
    id: string,
    updatedQuestionDto: UpdateQuestionInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    return request(this.app.getHttpServer())
      .put(`/sa/quiz/questions/${id}`)
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .send(updatedQuestionDto)
      .expect(statusCode);
  }

  async updateIsNotAuthorized(
    id: string,
    updatedQuestionDto: UpdateQuestionInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    return request(this.app.getHttpServer())
      .put(`/sa/quiz/questions/${id}`)
      .auth('invalid login', 'invalid password')
      .send(updatedQuestionDto)
      .expect(statusCode);
  }

  async updatePublish(
    id: string,
    updatedPublishDto: UpdatePublishInputDto,
    statusCode: number = HttpStatus.NOT_FOUND,
  ) {
    return await request(this.app.getHttpServer())
      .put(`/sa/quiz/questions/${id}/publish`)
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .send(updatedPublishDto)
      .expect(statusCode);
  }

  async updatePublishIsNotAuthorized(
    id: string,
    updatedPublishDto: UpdatePublishInputDto,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return await request(this.app.getHttpServer())
      .put(`/sa/quiz/questions/${id}/publish`)
      .auth('invalid login', 'invalid password')
      .send(updatedPublishDto)
      .expect(statusCode);
  }

  async delete(id: string, statusCode: number = HttpStatus.NO_CONTENT) {
    return request(this.app.getHttpServer())
      .delete(`/sa/quiz/questions/${id}`)
      .auth(this.coreConfig.ADMIN_LOGIN, this.coreConfig.ADMIN_PASSWORD)
      .expect(statusCode);
  }

  async deleteIsNotAuthorized(
    id: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
  ) {
    return request(this.app.getHttpServer())
      .delete(`/sa/quiz/questions/${id}`)
      .auth('invalid login', 'invalid password')
      .expect(statusCode);
  }
}
