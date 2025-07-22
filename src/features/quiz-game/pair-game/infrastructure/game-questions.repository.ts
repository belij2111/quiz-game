import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { GameQuestion } from '../domain/game-question.entity';

@Injectable()
export class GameQuestionsRepository {
  private getRepo(manager?: EntityManager) {
    return (
      manager?.getRepository(GameQuestion) ||
      this.dataSource.getRepository(GameQuestion)
    );
  }
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(gameQuestions: GameQuestion, manager?: EntityManager) {
    await this.getRepo(manager).save(gameQuestions);
  }

  async findNextQuestion(
    gameId: string,
    playerId: string,
    manager?: EntityManager,
  ): Promise<GameQuestion | null> {
    return this.getRepo(manager)
      .createQueryBuilder('gq')
      .leftJoinAndSelect('gq.question', 'question')
      .where('gq.gameId = :gameId', { gameId: gameId })
      .andWhere(
        'gq."question_id" NOT IN (SELECT answers."question_id" FROM answers WHERE answers."player_id" = :playerId)',
        { playerId: playerId },
      )
      .orderBy('gq."id"', 'ASC')
      .getOne();
  }

  async findByGameId(
    gameId: string,
    manager?: EntityManager,
  ): Promise<GameQuestion[]> {
    return this.getRepo(manager).find({ where: { gameId: gameId } });
  }
}
