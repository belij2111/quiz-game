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
}
