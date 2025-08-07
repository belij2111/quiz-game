import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AnswerInputDto } from '../../src/features/quiz-game/pair-game/api/input-dto/answer.input-dto';
import { GameStatus } from '../../src/features/quiz-game/pair-game/api/enums/game-status.enum';
import { paginationInputParams } from '../models/base/pagination.input-test-dto';
import { GamePairViewDto } from '../../src/features/quiz-game/pair-game/api/view-dto/game-pair.view-dto';
import { PaginatedViewModel } from '../../src/core/models/base-paginated.view-model';
import { MyStatisticViewDto } from '../../src/features/quiz-game/pair-game/api/view-dto/my-statistic.view-dto';
import { TopGamePlayerViewDto } from '../../src/features/quiz-game/pair-game/api/view-dto/top-game-player.view-dto';

export class PairGamesPublicTestManager {
  constructor(private readonly app: INestApplication) {}

  async createConnect(accessToken: string, statusCode: number = HttpStatus.OK) {
    const response = await request(this.app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);
    return response.body;
  }

  async getMyCurrent(accessToken: string, statusCode: number = HttpStatus.OK) {
    return request(this.app.getHttpServer())
      .get('/pair-game-quiz/pairs/my-current')
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);
  }

  async getById(
    accessToken: string,
    gameId: string,
    statusCode: number = HttpStatus.OK,
  ) {
    return await request(this.app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${gameId}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);
  }

  async sendAnswer(
    accessToken: string,
    answerDto: AnswerInputDto,
    statusCode: number = HttpStatus.OK,
  ) {
    const response = await request(this.app.getHttpServer())
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(accessToken, { type: 'bearer' })
      .send(answerDto)
      .expect(statusCode);
    return response.body;
  }

  expectCountScore(receivedScore: number, expectedScore: number) {
    expect(receivedScore).toBe(expectedScore);
  }

  expectGameStatus(receivedStatus: GameStatus, expectedStatus: GameStatus) {
    expect(receivedStatus).toBe(expectedStatus);
  }

  async getGamesWithPaging(
    accessToken: string,
    statusCode: number = HttpStatus.OK,
  ) {
    const { pageNumber, pageSize } = paginationInputParams;
    const sortBy = 'status';
    const sortDirection = 'asc';
    return await request(this.app.getHttpServer())
      .get(`/pair-game-quiz/pairs/my`)
      .auth(accessToken, { type: 'bearer' })
      .query({
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      })
      .expect(statusCode);
  }

  expectCorrectPagination(responseDto: PaginatedViewModel<GamePairViewDto[]>) {
    expect(responseDto.pagesCount).toBe(1);
    expect(responseDto.page).toBe(1);
    expect(responseDto.pageSize).toBe(10);
    expect(responseDto.totalCount).toBe(responseDto.items.length);
    expect(responseDto.items.length).toBe(3);
    expect(responseDto.items[0].status).toBe(GameStatus.ACTIVE);
    expect(responseDto.items[1].status).toBe(GameStatus.FINISHED);
    expect(responseDto.items[0]).toHaveProperty('id');
    responseDto.items.forEach((item) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('firstPlayerProgress');
      expect(item).toHaveProperty('secondPlayerProgress');
      expect(item).toHaveProperty('questions');
      expect(item).toHaveProperty('status');
      expect(item).toHaveProperty('pairCreatedDate');
      expect(item).toHaveProperty('startGameDate');
      expect(item).toHaveProperty('finishGameDate');
    });
  }

  async getMyStatistic(
    accessToken: string,
    statusCode: number = HttpStatus.OK,
  ) {
    const response = await request(this.app.getHttpServer())
      .get(`/pair-game-quiz/users/my-statistic`)
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);
    return response.body;
  }

  expectCorrectMyStatistic(responseDto: MyStatisticViewDto) {
    expect(responseDto).toHaveProperty('sumScore');
    expect(responseDto).toHaveProperty('avgScores');
    expect(responseDto).toHaveProperty('gamesCount');
    expect(responseDto).toHaveProperty('winsCount');
    expect(responseDto).toHaveProperty('lossesCount');
    expect(responseDto).toHaveProperty('drawsCount');
  }

  async getTopUsers(statusCode: number = HttpStatus.OK) {
    const { pageNumber, pageSize } = paginationInputParams;
    const sort = ['winsCount desc', 'avgScore asc'];
    const response = await request(this.app.getHttpServer())
      .get(`/pair-game-quiz/users/top`)
      .query({
        pageNumber,
        pageSize,
        sort,
      })
      .expect(statusCode);
    return response.body;
  }

  expectCorrectPaginationTopUsers(
    responseDto: PaginatedViewModel<TopGamePlayerViewDto[]>,
  ) {
    responseDto.items.forEach((item) => {
      expect(item).toHaveProperty('sumScore');
      expect(item).toHaveProperty('avgScores');
      expect(item).toHaveProperty('gamesCount');
      expect(item).toHaveProperty('winsCount');
      expect(item).toHaveProperty('lossesCount');
      expect(item).toHaveProperty('drawsCount');
      expect(item).toHaveProperty('player');
      expect(item.player).toHaveProperty('id');
      expect(item.player).toHaveProperty('login');
    });
  }

  async expectCorrectEndGame(responseDto: GamePairViewDto) {
    expect(responseDto.firstPlayerProgress.score).toBe(6);
    expect(responseDto.secondPlayerProgress!.score).toBe(1);
    expect(responseDto.status).toBe(GameStatus.FINISHED);
  }
}
