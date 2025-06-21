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

describe('e2e-Questions-admin', () => {
  let app: INestApplication;
  let questionsAdminTestManager: QuestionsAdminTestManager;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    const coreConfig = result.coreConfig;
    questionsAdminTestManager = new QuestionsAdminTestManager(app, coreConfig);
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
});
