import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../domain/answer.entity';
import { AnswerStatus } from '../api/enums/answer-status.enum';
import { GameQuestion } from '../domain/game-question.entity';

@Injectable()
export class AnswersRepository {
  constructor(
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
  ) {}

  async create(answer: Answer) {
    const result = await this.answersRepository.save(answer);
    return result.id;
  }

  async getCountByPlayerId(playerId: string): Promise<number> {
    return this.answersRepository.countBy({ playerId: playerId });
  }

  async hasAtLeastOneCorrectAnswer(playerId: string): Promise<boolean> {
    const count = await this.answersRepository.count({
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
  ): Promise<Date | null> {
    const result = await this.answersRepository
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
