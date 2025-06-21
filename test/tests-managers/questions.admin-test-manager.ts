import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CoreConfig } from '../../src/core/core.config';
import { CreateQuestionInputDto } from '../../src/features/quiz-game/questions/api/input-dto/create-question.input-dto';
import { QuestionViewDto } from '../../src/features/quiz-game/questions/api/view-dto/question.view-dto';

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
}
