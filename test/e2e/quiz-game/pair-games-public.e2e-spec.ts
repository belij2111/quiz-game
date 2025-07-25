import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../../helpers/init-settings';
import { deleteAllData } from '../../helpers/delete-all-data';
import { CoreTestManager } from '../../tests-managers/core.test-manager';
import { PairGamesPublicTestManager } from '../../tests-managers/pair-games.public-test-manager';
import { UsersTestManager } from '../../tests-managers/users.test-manager';
import { AuthTestManager } from '../../tests-managers/auth.test-manager';
import { LoginSuccessViewTestDto } from '../../models/user-accounts/view-test-dto/login-success.view-test-dto';
import { GamePairViewDto } from '../../../src/features/quiz-game/pair-game/api/view-dto/game-pair.view-dto';
import { QuestionViewDto } from '../../../src/features/quiz-game/questions/api/view-dto/question.view-dto';
import { QuestionsAdminTestManager } from '../../tests-managers/questions.admin-test-manager';
import { QUESTIONS_PULL } from '../../models/quiz-game/question.input-dto';
import { AnswerInputDto } from '../../../src/features/quiz-game/pair-game/api/input-dto/answer.input-dto';
import { delay } from '../../helpers/delay';

describe('e2e-Pair-Games-public', () => {
  let app: INestApplication;
  let pairGamesPublicTestManager: PairGamesPublicTestManager;
  let usersTestManager: UsersTestManager;
  let authTestManager: AuthTestManager;
  let coreTestManager: CoreTestManager;
  let questionsAdminTestManager: QuestionsAdminTestManager;
  let createdConnection: GamePairViewDto;
  let loginResult: LoginSuccessViewTestDto | undefined;
  let createdQuestions: QuestionViewDto[];
  let firstPlayerToken: string;
  let secondPlayerToken: string;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    const coreConfig = result.coreConfig;
    usersTestManager = new UsersTestManager(app, coreConfig);
    authTestManager = new AuthTestManager(app);
    pairGamesPublicTestManager = new PairGamesPublicTestManager(app);
    coreTestManager = new CoreTestManager();
    coreTestManager.setUsersTestManager(usersTestManager);
    coreTestManager.setAuthTestManager(authTestManager);
    questionsAdminTestManager = new QuestionsAdminTestManager(app, coreConfig);
  });
  beforeEach(async () => {
    await deleteAllData(app);
    createdQuestions = await questionsAdminTestManager.createQuestions(5);
    await questionsAdminTestManager.publishQuestions(createdQuestions);
    loginResult = await coreTestManager.loginUser(1);
    firstPlayerToken = loginResult!.accessToken;
    loginResult = await coreTestManager.loginUser(2);
    secondPlayerToken = loginResult!.accessToken;
  });
  afterEach(async () => {
    await deleteAllData(app);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('POST/pair-game-quiz/pairs/connection', () => {
    it(`should create new game with the pending status and connect the first player : STATUS 200`, async () => {
      createdConnection = await pairGamesPublicTestManager.createConnect(
        firstPlayerToken,
        HttpStatus.OK,
      );
      console.log('gamePending: ', createdConnection);
    });
    it(`should to connect the second player,asc questions and switch the game to the active status :STATUS 200`, async () => {
      createdConnection = await pairGamesPublicTestManager.createConnect(
        firstPlayerToken,
        HttpStatus.OK,
      );
      createdConnection = await pairGamesPublicTestManager.createConnect(
        secondPlayerToken,
        HttpStatus.OK,
      );
      console.log('gameActive: ', createdConnection);
    });
    it('should connect two new players to a new game', async () => {
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);

      loginResult = await coreTestManager.loginUser(3);
      const thirdPlayerToken = loginResult!.accessToken;
      loginResult = await coreTestManager.loginUser(4);
      const fourthPlayerToken = loginResult!.accessToken;
      await delay(1000);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(thirdPlayerToken);
      await delay(1000);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(fourthPlayerToken);
    });
    it(`shouldn't create new game if accessToken expired : STATUS 401`, async () => {
      await delay(10000);
      await pairGamesPublicTestManager.createConnect(
        firstPlayerToken,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't create new game if user is already participating in active pair : STATUS 403`, async () => {
      createdConnection = await pairGamesPublicTestManager.createConnect(
        firstPlayerToken,
        HttpStatus.OK,
      );
      createdConnection = await pairGamesPublicTestManager.createConnect(
        secondPlayerToken,
        HttpStatus.OK,
      );
      createdConnection = await pairGamesPublicTestManager.createConnect(
        firstPlayerToken,
        HttpStatus.FORBIDDEN,
      );
    });
  });
  describe('GET/pair-game-quiz/pairs/my-current', () => {
    beforeEach(async () => {
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
    });
    it('should return a current unfinished user game : STATUS 200 ', async () => {
      const createResponseForFirstPlayer =
        await pairGamesPublicTestManager.getMyCurrent(
          firstPlayerToken,
          HttpStatus.OK,
        );
      console.log(
        'createResponseForFirstPlayer: ',
        createResponseForFirstPlayer.body,
      );
      const createResponseForSecondPlayer =
        await pairGamesPublicTestManager.getMyCurrent(
          secondPlayerToken,
          HttpStatus.OK,
        );
      console.log(
        'createResponseForSecondPlayer: ',
        createResponseForSecondPlayer.body,
      );
    });
    it('should return the current game after the first answers : STATUS 200', async () => {
      const answerDto = {
        answer: QUESTIONS_PULL[0].correctAnswers[0],
      };
      await pairGamesPublicTestManager.sendAnswer(firstPlayerToken, answerDto);
      await pairGamesPublicTestManager.sendAnswer(secondPlayerToken, answerDto);
      await pairGamesPublicTestManager.sendAnswer(secondPlayerToken, answerDto);

      loginResult = await coreTestManager.loginUser(3);
      const thirdPlayerToken = loginResult!.accessToken;
      await delay(1000);
      loginResult = await coreTestManager.loginUser(4);
      const fourthPlayerToken = loginResult!.accessToken;

      await pairGamesPublicTestManager.createConnect(thirdPlayerToken);
      await delay(1000);
      await pairGamesPublicTestManager.createConnect(fourthPlayerToken);

      await delay(1000);
      await pairGamesPublicTestManager.getMyCurrent(
        firstPlayerToken,
        HttpStatus.OK,
      );
    });
    it(`shouldn't return a game if accessToken expired : STATUS 401`, async () => {
      await delay(10000);
      await pairGamesPublicTestManager.getMyCurrent(
        firstPlayerToken,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't return a game if it does not exist : STATUS 404`, async () => {
      loginResult = await coreTestManager.loginUser(3);
      const thirdPlayerToken = loginResult!.accessToken;
      await pairGamesPublicTestManager.getMyCurrent(
        thirdPlayerToken,
        HttpStatus.NOT_FOUND,
      );
    });
    it(`shouldn't return the game if it is finished : STATUS 404`, async () => {
      const answerDto = {
        answer: QUESTIONS_PULL[0].correctAnswers[0],
      };
      for (let i = 1; i <= 5; i++) {
        await delay(0);
        await pairGamesPublicTestManager.sendAnswer(
          firstPlayerToken,
          answerDto,
        );
        await pairGamesPublicTestManager.sendAnswer(
          secondPlayerToken,
          answerDto,
        );
      }
      await delay(1000);
      await pairGamesPublicTestManager.getMyCurrent(
        firstPlayerToken,
        HttpStatus.NOT_FOUND,
      );
    });
  });
  describe('POST/pair-game-quiz/pairs/my-current/answers', () => {
    let answerDto: AnswerInputDto;
    beforeEach(async () => {
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
      answerDto = {
        answer: QUESTIONS_PULL[0].correctAnswers[0],
      };
    });
    it('should send answer for next answered question : STATUS 200', async () => {
      for (let i = 1; i <= 5; i++) {
        await delay(0);
        const firstPlayerAnswer: GamePairViewDto =
          await pairGamesPublicTestManager.sendAnswer(
            firstPlayerToken,
            answerDto,
            HttpStatus.OK,
          );
        console.log('firstPlayerAnswer: ', firstPlayerAnswer);
        const secondPlayerAnswer: GamePairViewDto =
          await pairGamesPublicTestManager.sendAnswer(
            secondPlayerToken,
            answerDto,
            HttpStatus.OK,
          );
        console.log('firstPlayerAnswer: ', secondPlayerAnswer);
        console.log('count: ', i);
      }
    });
    it(`shouldn't send answer for next answered question if accessToken expired : STATUS 401`, async () => {
      await delay(10000);
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        answerDto,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't send answer for next answered if user is not in active pair : STATUS 403`, async () => {
      loginResult = await coreTestManager.loginUser(3);
      const thirdPlayerToken = loginResult!.accessToken;
      await pairGamesPublicTestManager.sendAnswer(
        thirdPlayerToken,
        answerDto,
        HttpStatus.FORBIDDEN,
      );
    });
    it(`shouldn't send answer if has already answered to all questions : STATUS 403`, async () => {
      for (let i = 1; i <= 5; i++) {
        await delay(0);
        await pairGamesPublicTestManager.sendAnswer(
          firstPlayerToken,
          answerDto,
          HttpStatus.OK,
        );
      }
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        answerDto,
        HttpStatus.FORBIDDEN,
      );
    });
  });
  describe('GET/pair-game-quiz/pairs/:id', () => {
    beforeEach(async () => {
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
    });
    it('should return game by id : STATUS 200 ', async () => {
      const gameId = createdConnection.id;
      const createResponseForFirstPlayer =
        await pairGamesPublicTestManager.getById(
          firstPlayerToken,
          gameId,
          HttpStatus.OK,
        );
      console.log('game for first player: ', createResponseForFirstPlayer.body);
      const createResponseForSecondPlayer =
        await pairGamesPublicTestManager.getById(
          secondPlayerToken,
          gameId,
          HttpStatus.OK,
        );
      console.log(
        'game for second player: ',
        createResponseForSecondPlayer.body,
      );
    });
    it(`shouldn't return game by id if accessToken expired : STATUS 401`, async () => {
      const gameId = createdConnection.id;
      await delay(10000);
      await pairGamesPublicTestManager.getById(
        firstPlayerToken,
        gameId,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't return game by id if user is not in an active pair : STATUS 403`, async () => {
      const gameId = createdConnection.id;
      loginResult = await coreTestManager.loginUser(3);
      const thirdPlayerToken = loginResult!.accessToken;
      await pairGamesPublicTestManager.getById(
        thirdPlayerToken,
        gameId,
        HttpStatus.FORBIDDEN,
      );
    });
    it(`shouldn't return game by ID with incorrect input data : STATUS 400`, async () => {
      const invalidUUID = 'invalid id';
      await pairGamesPublicTestManager.getById(
        secondPlayerToken,
        invalidUUID,
        HttpStatus.BAD_REQUEST,
      );
    });
  });
});
