import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameQuestion } from '../domain/game-question.entity';

@Injectable()
export class GameQuestionsRepository {
  constructor(
    @InjectRepository(GameQuestion)
    private readonly gameQuestionsRepository: Repository<GameQuestion>,
  ) {}

  async create(gameQuestions: GameQuestion) {
    await this.gameQuestionsRepository.save(gameQuestions);
  }

  async findNextQuestion(
    gameId: string,
    playerId: string,
  ): Promise<GameQuestion | null> {
    return this.gameQuestionsRepository
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

  async findByGameId(gameId: string): Promise<GameQuestion[]> {
    return this.gameQuestionsRepository.find({ where: { gameId: gameId } });
  }
}
