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
import { GameStatus } from '../../../src/features/quiz-game/pair-game/api/enums/game-status.enum';
import { MyStatisticViewDto } from '../../../src/features/quiz-game/pair-game/api/view-dto/my-statistic.view-dto';
import { TopGamePlayerViewDto } from '../../../src/features/quiz-game/pair-game/api/view-dto/top-game-player.view-dto';
import { PaginatedViewModel } from '../../../src/core/models/base-paginated.view-model';

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
  let correctAnswer: AnswerInputDto;
  let incorrectAnswer: AnswerInputDto;

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
    correctAnswer = { answer: QUESTIONS_PULL[0].correctAnswers[0] };
    incorrectAnswer = { answer: 'incorrect' };
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
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        correctAnswer,
      );
      await pairGamesPublicTestManager.sendAnswer(
        secondPlayerToken,
        correctAnswer,
      );
      await pairGamesPublicTestManager.sendAnswer(
        secondPlayerToken,
        correctAnswer,
      );

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
    it('should to create two active games, but return only the game for the current user : STATUS 200', async () => {
      // user1: 2 correct
      // user2: 1 correct
      // user1: 1 incorrect
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        correctAnswer,
      );
      const result1 =
        await pairGamesPublicTestManager.getMyCurrent(firstPlayerToken);
      pairGamesPublicTestManager.expectCountScore(
        result1.body.firstPlayerProgress.score,
        1,
      );
      pairGamesPublicTestManager.expectGameStatus(
        result1.body.status,
        GameStatus.ACTIVE,
      );

      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        correctAnswer,
      );
      await pairGamesPublicTestManager.sendAnswer(
        secondPlayerToken,
        correctAnswer,
      );
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        incorrectAnswer,
      );

      // user3: connect
      // user4: connect
      loginResult = await coreTestManager.loginUser(3);
      const thirdPlayerToken = loginResult!.accessToken;
      loginResult = await coreTestManager.loginUser(4);
      const fourthPlayerToken = loginResult!.accessToken;
      await pairGamesPublicTestManager.createConnect(thirdPlayerToken);
      await pairGamesPublicTestManager.createConnect(fourthPlayerToken);

      // user3: 1 correct
      // user4: 1 correct
      await pairGamesPublicTestManager.sendAnswer(
        thirdPlayerToken,
        correctAnswer,
      );
      await pairGamesPublicTestManager.sendAnswer(
        fourthPlayerToken,
        correctAnswer,
      );

      // user3: /my-current
      await delay(1000);
      const result = await pairGamesPublicTestManager.getMyCurrent(
        firstPlayerToken,
        HttpStatus.OK,
      );
      console.log('result :', result.body);
    });
    it('should return the current game after each answer and the winner is the firstPlayer : STATUS 200', async () => {
      // 1. firstPlayer: 3 correct
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        correctAnswer,
      );
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        correctAnswer,
      );
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        correctAnswer,
      );
      // 2. secondPlayer: 2 correct 1 incorrect
      await pairGamesPublicTestManager.sendAnswer(
        secondPlayerToken,
        correctAnswer,
      );
      await pairGamesPublicTestManager.sendAnswer(
        secondPlayerToken,
        correctAnswer,
      );
      await pairGamesPublicTestManager.sendAnswer(
        secondPlayerToken,
        incorrectAnswer,
      );

      const game =
        await pairGamesPublicTestManager.getMyCurrent(firstPlayerToken);
      console.log(game.body.firstPlayerProgress.answers);
      console.log(game.body.secondPlayerProgress.answers);

      pairGamesPublicTestManager.expectCountScore(
        game.body.firstPlayerProgress.score,
        3,
      );
      pairGamesPublicTestManager.expectCountScore(
        game.body.secondPlayerProgress.score,
        2,
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
      for (let i = 1; i <= 5; i++) {
        await delay(0);
        await pairGamesPublicTestManager.sendAnswer(
          firstPlayerToken,
          correctAnswer,
        );
        await pairGamesPublicTestManager.sendAnswer(
          secondPlayerToken,
          correctAnswer,
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
    beforeEach(async () => {
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
    });
    it('should send answer for next answered question : STATUS 200', async () => {
      for (let i = 1; i <= 5; i++) {
        await delay(0);
        const firstPlayerAnswer: GamePairViewDto =
          await pairGamesPublicTestManager.sendAnswer(
            firstPlayerToken,
            correctAnswer,
            HttpStatus.OK,
          );
        console.log('firstPlayerAnswer: ', firstPlayerAnswer);
        const secondPlayerAnswer: GamePairViewDto =
          await pairGamesPublicTestManager.sendAnswer(
            secondPlayerToken,
            correctAnswer,
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
        correctAnswer,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't send answer for next answered if user is not in active pair : STATUS 403`, async () => {
      loginResult = await coreTestManager.loginUser(3);
      const thirdPlayerToken = loginResult!.accessToken;
      await pairGamesPublicTestManager.sendAnswer(
        thirdPlayerToken,
        correctAnswer,
        HttpStatus.FORBIDDEN,
      );
    });
    it(`shouldn't send answer if has already answered to all questions : STATUS 403`, async () => {
      for (let i = 1; i <= 5; i++) {
        await delay(0);
        await pairGamesPublicTestManager.sendAnswer(
          firstPlayerToken,
          correctAnswer,
          HttpStatus.OK,
        );
      }
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        correctAnswer,
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
  describe('checking the game search methods', () => {
    let thirdPlayerToken: string;
    let fourthPlayerToken: string;
    beforeEach(async () => {
      loginResult = await coreTestManager.loginUser(3);
      thirdPlayerToken = loginResult!.accessToken;
      loginResult = await coreTestManager.loginUser(4);
      fourthPlayerToken = loginResult!.accessToken;
    });
    it('should return game : STATUS 200 ', async () => {
      // 1. First game (user1, user2)
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
      // firstPlayer: 1 correct
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        correctAnswer,
      );
      // secondPlayer: 1 incorrect 1 correct
      await pairGamesPublicTestManager.sendAnswer(
        secondPlayerToken,
        incorrectAnswer,
      );
      await pairGamesPublicTestManager.sendAnswer(
        secondPlayerToken,
        correctAnswer,
      );
      // 2. Second game (user3, user4)
      createdConnection =
        await pairGamesPublicTestManager.createConnect(thirdPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(fourthPlayerToken);
      // thirdPlayer: 1 correct
      await pairGamesPublicTestManager.sendAnswer(
        thirdPlayerToken,
        correctAnswer,
      );
      // fourthPlayer: 1 incorrect 1 correct
      await pairGamesPublicTestManager.sendAnswer(
        fourthPlayerToken,
        incorrectAnswer,
      );
      await pairGamesPublicTestManager.sendAnswer(
        fourthPlayerToken,
        correctAnswer,
      );
      // 3. First game (continuation, status: Finished , win: user1)
      // firstPlayer: 2 correct
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        correctAnswer,
      );
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        correctAnswer,
      );
      // secondPlayer: 1 incorrect 1 correct
      await pairGamesPublicTestManager.sendAnswer(
        secondPlayerToken,
        incorrectAnswer,
      );
      await pairGamesPublicTestManager.sendAnswer(
        secondPlayerToken,
        correctAnswer,
      );
      // firstPlayer: 1 incorrect 1 correct
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        incorrectAnswer,
      );
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        correctAnswer,
      );
      const firstGame =
        await pairGamesPublicTestManager.getMyCurrent(firstPlayerToken);
      // console.log('firstGame :', firstGame.body);
      pairGamesPublicTestManager.expectGameStatus(
        firstGame.body.status,
        GameStatus.ACTIVE,
      );
      // secondPlayer: 1 correct
      await pairGamesPublicTestManager.sendAnswer(
        secondPlayerToken,
        incorrectAnswer,
      );
      // 3. Third game (user1, user2)
      await delay(0);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      // console.log(createdConnection);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
      // console.log('createdConnection :',createdConnection);
      // firstPlayer: 1 correct
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        correctAnswer,
      );
      const thirdGame =
        await pairGamesPublicTestManager.getMyCurrent(firstPlayerToken);
      // console.log('thirdGame :', thirdGame.body);
      pairGamesPublicTestManager.expectGameStatus(
        thirdGame.body.status,
        GameStatus.ACTIVE,
      );
      pairGamesPublicTestManager.expectCountScore(
        thirdGame.body.firstPlayerProgress.score,
        1,
      );
    });
  });
  describe('GET/pair-game-quiz/pairs/my', () => {
    beforeEach(async () => {
      // 1. First game (status: Finished )
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
      for (let i = 1; i <= 5; i++) {
        await pairGamesPublicTestManager.sendAnswer(
          firstPlayerToken,
          correctAnswer,
        );
        await pairGamesPublicTestManager.sendAnswer(
          secondPlayerToken,
          correctAnswer,
        );
      }
      // 2. Second game (status: Finished )
      await delay(1000);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
      for (let i = 1; i <= 5; i++) {
        await pairGamesPublicTestManager.sendAnswer(
          firstPlayerToken,
          incorrectAnswer,
        );
        await pairGamesPublicTestManager.sendAnswer(
          secondPlayerToken,
          correctAnswer,
        );
      }
      // 3. Third game (status: Active)
      await delay(1000);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
      await pairGamesPublicTestManager.sendAnswer(
        firstPlayerToken,
        correctAnswer,
      );
    });
    it('should return all my games with pagination : STATUS 200', async () => {
      const createResponseForFirstPlayer =
        await pairGamesPublicTestManager.getGamesWithPaging(
          firstPlayerToken,
          HttpStatus.OK,
        );
      pairGamesPublicTestManager.expectCorrectPagination(
        createResponseForFirstPlayer.body,
      );
    });
  });
  describe('GET/pair-game-quiz/users/my-statistic', () => {
    beforeEach(async () => {
      // 1. First game (firsPlayer: Win )
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
      for (let i = 1; i <= 5; i++) {
        await pairGamesPublicTestManager.sendAnswer(
          firstPlayerToken,
          correctAnswer,
        );
        await pairGamesPublicTestManager.sendAnswer(
          secondPlayerToken,
          correctAnswer,
        );
      }
      // 2. Second game (secondPlayer:Win )
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
      for (let i = 1; i <= 5; i++) {
        await pairGamesPublicTestManager.sendAnswer(
          firstPlayerToken,
          incorrectAnswer,
        );
        await pairGamesPublicTestManager.sendAnswer(
          secondPlayerToken,
          correctAnswer,
        );
      }
      // 3. Third game (firstPlayer: Draw, secondPlayer: Draw )
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
      for (let i = 1; i <= 5; i++) {
        await pairGamesPublicTestManager.sendAnswer(
          firstPlayerToken,
          incorrectAnswer,
        );
        await pairGamesPublicTestManager.sendAnswer(
          secondPlayerToken,
          incorrectAnswer,
        );
      }
    });
    it('should return statistics of the current user : STATUS 200', async () => {
      const createResponseForFirstPlayer: MyStatisticViewDto =
        await pairGamesPublicTestManager.getMyStatistic(
          secondPlayerToken,
          HttpStatus.OK,
        );
      pairGamesPublicTestManager.expectCorrectMyStatistic(
        createResponseForFirstPlayer,
      );
    });
    it(`shouldn't return statistics of the current user if accessToken expired : STATUS 401`, async () => {
      await delay(10000);
      await pairGamesPublicTestManager.getMyStatistic(
        secondPlayerToken,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });
  describe('GET/pair-game-quiz/users/top', () => {
    beforeEach(async () => {
      // 1. First game (user1: Win )
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
      for (let i = 1; i <= 5; i++) {
        await pairGamesPublicTestManager.sendAnswer(
          firstPlayerToken,
          correctAnswer,
        );
        await pairGamesPublicTestManager.sendAnswer(
          secondPlayerToken,
          correctAnswer,
        );
      }
      // 2. Second game (user1:Win )
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
      for (let i = 1; i <= 5; i++) {
        await pairGamesPublicTestManager.sendAnswer(
          firstPlayerToken,
          correctAnswer,
        );
        await pairGamesPublicTestManager.sendAnswer(
          secondPlayerToken,
          correctAnswer,
        );
      }
      // 3. Third game (user3: Win)
      loginResult = await coreTestManager.loginUser(3);
      const thirdPlayerToken = loginResult!.accessToken;
      loginResult = await coreTestManager.loginUser(4);
      const fourthPlayerToken = loginResult!.accessToken;
      createdConnection =
        await pairGamesPublicTestManager.createConnect(thirdPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(fourthPlayerToken);
      for (let i = 1; i <= 5; i++) {
        await pairGamesPublicTestManager.sendAnswer(
          thirdPlayerToken,
          correctAnswer,
        );
        await pairGamesPublicTestManager.sendAnswer(
          fourthPlayerToken,
          incorrectAnswer,
        );
      }
      // 4. Fourth game (user4: Win)
      createdConnection =
        await pairGamesPublicTestManager.createConnect(thirdPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(fourthPlayerToken);
      for (let i = 1; i <= 5; i++) {
        await pairGamesPublicTestManager.sendAnswer(
          thirdPlayerToken,
          incorrectAnswer,
        );
        await pairGamesPublicTestManager.sendAnswer(
          fourthPlayerToken,
          correctAnswer,
        );
      }
    });
    it('should return top users with pagination : STATUS 200', async () => {
      const createResponse: PaginatedViewModel<TopGamePlayerViewDto[]> =
        await pairGamesPublicTestManager.getTopUsers(HttpStatus.OK);
      console.log('createResponse :', createResponse);
      pairGamesPublicTestManager.expectCorrectPaginationTopUsers(
        createResponse,
      );
    });
  });
  describe('checking the end of the game', () => {
    beforeEach(async () => {
      // 1. First game (user1: Win, score: 6 / user2: Lose, score: 1 )
      createdConnection =
        await pairGamesPublicTestManager.createConnect(firstPlayerToken);
      createdConnection =
        await pairGamesPublicTestManager.createConnect(secondPlayerToken);
      for (let i = 1; i <= 5; i++) {
        await pairGamesPublicTestManager.sendAnswer(
          firstPlayerToken,
          correctAnswer,
        );
      }
      await pairGamesPublicTestManager.sendAnswer(
        secondPlayerToken,
        correctAnswer,
      );
    });
    it('should end the game 10 seconds after all the answers of one of the players : STATUS 200', async () => {
      await delay(9000);
      const createResponseForStatusActive =
        await pairGamesPublicTestManager.getMyCurrent(
          firstPlayerToken,
          HttpStatus.OK,
        );
      console.log(
        'createResponseForFirstPlayer: ',
        createResponseForStatusActive.body,
      );
      await delay(10000);
      const createResponseForStatusFinished =
        await pairGamesPublicTestManager.getById(
          firstPlayerToken,
          createResponseForStatusActive.body.id,
        );
      console.log(
        'createResponseForFirstPlayer: ',
        createResponseForStatusFinished.body,
      );
      await pairGamesPublicTestManager.expectCorrectEndGame(
        createResponseForStatusFinished.body,
      );
    });
  });
});
