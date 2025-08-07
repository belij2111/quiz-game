import { Injectable, Logger } from '@nestjs/common';
import { GamesRepository } from '../../infrastructure/games.repository';
import { GameQuestionsRepository } from '../../infrastructure/game-questions.repository';
import { AnswersRepository } from '../../infrastructure/answers.repository';
import {
  FinishGameCommand,
  FinishGameCommandUseCase,
} from '../use-cases/finish-game.use-case';
import { Cron } from '@nestjs/schedule';
import { GameStatus } from '../../api/enums/game-status.enum';
import { Game } from '../../domain/game.entity';

@Injectable()
export class GameTimeoutService {
  private readonly logger = new Logger(GameTimeoutService.name);
  private readonly TIMEOUT_SECONDS = 9;
  private readonly gameCheckTimestamps = new Map<string, number>();
  constructor(
    private readonly gamesRepository: GamesRepository,
    private readonly gameQuestionsRepository: GameQuestionsRepository,
    private readonly answersRepository: AnswersRepository,
    private readonly finishGameCommandUseCase: FinishGameCommandUseCase,
  ) {}

  @Cron('*/1 * * * * *')
  async checkGamesForTimeout() {
    try {
      const activeGames = await this.gamesRepository.findActiveGames();
      for (const game of activeGames) {
        await this.checksGameTimeout(game);
      }
    } catch (error) {
      this.logger.error(`Error checking game timeout: ${error.message}`);
    }
  }

  private async checksGameTimeout(game: Game) {
    const totalQuestions = await this.gameQuestionsRepository.findCountByGameId(
      game.id,
    );
    const [firstPlayerAnswerCount, secondPlayerAnswerCount] = await Promise.all(
      [
        this.answersRepository.getCountByPlayerId(game.firstPlayerId),
        this.answersRepository.getCountByPlayerId(game.secondPlayerId!),
      ],
    );
    const isFirstFinished = firstPlayerAnswerCount === totalQuestions;
    const isSecondFinished = secondPlayerAnswerCount === totalQuestions;
    if (isFirstFinished && isSecondFinished) {
      return await this.tryFinishGame(game.id);
    }
    const isTimeoutCondition = isFirstFinished || isSecondFinished;
    if (!isTimeoutCondition) {
      this.gameCheckTimestamps.delete(game.id);
      return;
    }
    const startTime = this.gameCheckTimestamps.get(game.id);
    if (!startTime) {
      this.gameCheckTimestamps.set(game.id, Date.now());
      this.logger.log(`Started timeout tracking for game ${game.id}`);
      return;
    }
    const timeSpent = Date.now() - startTime;
    if (timeSpent < this.TIMEOUT_SECONDS * 1000) return;
    await this.tryFinishGame(game.id);
    this.gameCheckTimestamps.delete(game.id);
  }

  private async tryFinishGame(gameId: string) {
    const game = await this.gamesRepository.findById(gameId);
    if (game && game.status === GameStatus.ACTIVE) {
      this.logger.log(`Finishing game ${gameId} by timeout`);
      await this.finishGameCommandUseCase.execute(
        new FinishGameCommand(gameId),
      );
    }
  }
}
