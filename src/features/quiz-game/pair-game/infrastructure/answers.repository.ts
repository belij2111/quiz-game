import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Answer } from '../domain/answer.entity';
import { AnswerStatus } from '../api/enums/answer-status.enum';
import { GameQuestion } from '../domain/game-question.entity';

@Injectable()
export class AnswersRepository {
  private getRepo(manager?: EntityManager): Repository<Answer> {
    return (
      manager?.getRepository(Answer) || this.dataSource.getRepository(Answer)
    );
  }
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(answer: Answer, manager?: EntityManager) {
    const result = await this.getRepo(manager).save(answer);
    return result.id;
  }

  async getCountByPlayerId(
    playerId: string,
    manager?: EntityManager,
  ): Promise<number> {
    return this.getRepo(manager).countBy({ playerId: playerId });
  }

  async hasAtLeastOneCorrectAnswer(
    playerId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const count = await this.getRepo(manager).count({
      where: {
        playerId: playerId,
        answerStatus: AnswerStatus.CORRECT,
      },
    });
    return count > 0;
  }

  async getLastAnswerDate(
    playerId: string,
    gameId: string,
    manager?: EntityManager,
  ): Promise<Date | null> {
    const result = await this.getRepo(manager)
      .createQueryBuilder('a')
      .select('MAX(a."created_at") as "lastAnswerDate"')
      .where('a."player_id" = :playerId', { playerId: playerId })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('gq."question_id"')
          .from(GameQuestion, 'gq')
          .where('gq."game_id" = :gameId', { gameId: gameId })
          .getQuery();
        return `a."question_id" IN ${subQuery}`;
      })
      .getRawOne();
    return result.lastAnswerDate ? new Date(result.lastAnswerDate) : null;
  }
}
