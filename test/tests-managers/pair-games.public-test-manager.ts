import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AnswerInputDto } from '../../src/features/quiz-game/pair-game/api/input-dto/answer.input-dto';

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
}
