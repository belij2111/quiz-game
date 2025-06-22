import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../../helpers/init-settings';
import { deleteAllData } from '../../helpers/delete-all-data';
import { QuestionsAdminTestManager } from '../../tests-managers/questions.admin-test-manager';
import { CreateQuestionInputDto } from '../../../src/features/quiz-game/questions/api/input-dto/create-question.input-dto';
import { QuestionViewDto } from '../../../src/features/quiz-game/questions/api/view-dto/question.view-dto';
import {
  createInValidQuestionDto,
  createValidQuestionDto,
} from '../../models/quiz-game/question.input-dto';
import { CoreTestManager } from '../../tests-managers/core.test-manager';
import { UpdateQuestionInputDto } from '../../../src/features/quiz-game/questions/api/input-dto/update-question.input-dto';
import { getMockUuidId } from '../../helpers/get-mock-uuid-id';
import { UpdatePublishInputDto } from '../../../src/features/quiz-game/questions/api/input-dto/update-publish.input-dto';
import {
  createInvalidPublishDto,
  createPublishDto,
} from '../../models/quiz-game/publish.input-dto';

describe('e2e-Questions-admin', () => {
  let app: INestApplication;
  let questionsAdminTestManager: QuestionsAdminTestManager;
  let coreTestManager: CoreTestManager;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    const coreConfig = result.coreConfig;
    questionsAdminTestManager = new QuestionsAdminTestManager(app, coreConfig);
    coreTestManager = new CoreTestManager();
  });
  beforeEach(async () => {
    await deleteAllData(app);
  });
  afterEach(async () => {
    await deleteAllData(app);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('POST/questions', () => {
    it(`should create new questions : STATUS 201`, async () => {
      const validQuestionDto: CreateQuestionInputDto = createValidQuestionDto();
      // console.log('validQuestionDto :', validQuestionDto);
      const createdResponse: QuestionViewDto =
        await questionsAdminTestManager.create(
          validQuestionDto,
          HttpStatus.CREATED,
        );
      // console.log('createdResponse :', createdResponse);
      questionsAdminTestManager.expectCorrectDto(
        validQuestionDto,
        createdResponse,
      );
    });
    it(`shouldn't create new question with incorrect input data : STATUS 400`, async () => {
      const invalidQuestionDto: CreateQuestionInputDto =
        createInValidQuestionDto();
      await questionsAdminTestManager.create(
        invalidQuestionDto,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't create new question if the request is unauthorized : STATUS 404 `, async () => {
      const validQuestionDto: CreateQuestionInputDto = createValidQuestionDto();
      await questionsAdminTestManager.createIsNotAuthorized(
        validQuestionDto,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe('GET/questions', () => {
    it(`should return questions with pagination`, async () => {
      const createdQuestions: QuestionViewDto[] =
        await questionsAdminTestManager.createQuestions(5);
      const createResponse =
        await questionsAdminTestManager.getQuestionsWithPaging(HttpStatus.OK);
      await coreTestManager.expectCorrectPagination(
        createdQuestions,
        createResponse.body,
      );
      // console.log('createResponse.body :', createResponse.body);
    });
    it(`shouldn't return questions with paging if request is unauthorized : STATUS 401`, async () => {
      await questionsAdminTestManager.createQuestions(5);
      await questionsAdminTestManager.getQuestionsIsNotAuthorized(
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe('PUT/questions/:id', () => {
    let createdQuestion: QuestionViewDto;
    beforeEach(async () => {
      const validQuestionDto: CreateQuestionInputDto = createValidQuestionDto();
      createdQuestion =
        await questionsAdminTestManager.create(validQuestionDto);
    });
    it(`should update question by ID : STATUS 204`, async () => {
      const updatedQuestionDto: UpdateQuestionInputDto =
        createValidQuestionDto(5);
      // console.log('updatedQuestionDto :', updatedQuestionDto);
      await questionsAdminTestManager.update(
        createdQuestion.id,
        updatedQuestionDto,
        HttpStatus.NO_CONTENT,
      );
    });
    it(`shouldn't update question by ID with incorrect input data : STATUS 400`, async () => {
      const invalidQuestionDto: UpdateQuestionInputDto =
        createInValidQuestionDto();
      await questionsAdminTestManager.update(
        createdQuestion.id,
        invalidQuestionDto,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't update question by ID if the request is unauthorized : STATUS 401 `, async () => {
      const updatedQuestionDto: UpdateQuestionInputDto =
        createValidQuestionDto();
      await questionsAdminTestManager.updateIsNotAuthorized(
        createdQuestion.id,
        updatedQuestionDto,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't update question by ID if it does not exist : STATUS 404`, async () => {
      const updatedQuestionDto: UpdateQuestionInputDto =
        createValidQuestionDto();
      const nonExistentId = getMockUuidId();
      await questionsAdminTestManager.update(
        nonExistentId,
        updatedQuestionDto,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('PUT/questions/:id/publish', () => {
    let createdQuestion: QuestionViewDto;
    beforeEach(async () => {
      const validQuestionDto: CreateQuestionInputDto = createValidQuestionDto();
      createdQuestion =
        await questionsAdminTestManager.create(validQuestionDto);
    });
    it(`should update question publication status : STATUS 204`, async () => {
      const updatedPublishDto: UpdatePublishInputDto = createPublishDto();
      // console.log('updatedPublishDto :', updatedPublishDto);
      await questionsAdminTestManager.updatePublish(
        createdQuestion.id,
        updatedPublishDto,
        HttpStatus.NO_CONTENT,
      );
    });
    it(`shouldn't update question publication status with incorrect input data : STATUS 400 `, async () => {
      const invalidPublishDto: UpdatePublishInputDto =
        createInvalidPublishDto();
      await questionsAdminTestManager.updatePublish(
        createdQuestion.id,
        invalidPublishDto,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't update question publication status if the request is unauthorized `, async () => {
      const updatedPublishDto: UpdatePublishInputDto = createPublishDto();
      await questionsAdminTestManager.updatePublishIsNotAuthorized(
        createdQuestion.id,
        updatedPublishDto,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });
});
