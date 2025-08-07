import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Player } from '../../domain/player.entity';
import { PlayerStatusEnum } from '../../api/enums/player-status.enum';
import { DataSource, EntityManager } from 'typeorm';
import { GamesRepository } from '../../infrastructure/games.repository';
import { PlayersRepository } from '../../infrastructure/players.repository';
import { AnswersRepository } from '../../infrastructure/answers.repository';
import { GameStatus } from '../../api/enums/game-status.enum';
import { GameQuestionsRepository } from '../../infrastructure/game-questions.repository';

const BONUS_SCORE = 1;

export class FinishGameCommand {
  constructor(public gameId: string) {}
}

@CommandHandler(FinishGameCommand)
export class FinishGameCommandUseCase
  implements ICommandHandler<FinishGameCommand>
{
  constructor(
    private readonly dataSource: DataSource,
    private readonly gamesRepository: GamesRepository,
    private readonly playersRepository: PlayersRepository,
    private readonly answersRepository: AnswersRepository,
    private readonly gameQuestionsRepository: GameQuestionsRepository,
  ) {}
  async execute(
    command: FinishGameCommand,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const runInTransaction = async (manager: EntityManager) => {
      const foundGame = await this.gamesRepository.findByIdOrNotFoundFail(
        command.gameId,
        manager,
      );
      const firstPlayer = await this.playersRepository.findByIdOrNotFoundFail(
        foundGame.firstPlayerId,
        manager,
      );
      const secondPlayer = await this.playersRepository.findByIdOrNotFoundFail(
        foundGame.secondPlayerId!,
        manager,
      );
      const isFirstPlayerCorrectAnswers: boolean =
        await this.answersRepository.hasAtLeastOneCorrectAnswer(
          foundGame.firstPlayerId,
          manager,
        );
      const isSecondPlayerCorrectAnswers: boolean =
        await this.answersRepository.hasAtLeastOneCorrectAnswer(
          foundGame.secondPlayerId!,
          manager,
        );
      const firstPlayerFinishedFirst: boolean =
        await this.checkFirstPlayerFinishedFirst(
          foundGame.firstPlayerId,
          foundGame.secondPlayerId!,
          foundGame.id,
          manager,
        );
      if (isFirstPlayerCorrectAnswers && firstPlayerFinishedFirst) {
        firstPlayer.score += BONUS_SCORE;
      }
      if (isSecondPlayerCorrectAnswers && !firstPlayerFinishedFirst) {
        secondPlayer.score += BONUS_SCORE;
      }
      await this.determinePlayerStatus(firstPlayer, secondPlayer);
      await this.playersRepository.update(firstPlayer, manager);
      await this.playersRepository.update(secondPlayer, manager);

      foundGame.update({
        status: GameStatus.FINISHED,
        finishedGameDate: new Date(),
      });
      await this.gamesRepository.update(foundGame, manager);
    };
    if (!transactionManager) {
      return this.dataSource.transaction(runInTransaction);
    }
    return runInTransaction(transactionManager);
  }

  private async checkFirstPlayerFinishedFirst(
    firstPlayerId: string,
    secondPlayerId: string,
    gameId: string,
    manager: EntityManager,
  ): Promise<boolean> {
    const firstPlayerCount = await this.answersRepository.getCountByPlayerId(
      firstPlayerId,
      manager,
    );
    const secondPlayerCount = await this.answersRepository.getCountByPlayerId(
      secondPlayerId,
      manager,
    );
    const totalQuestions = await this.gameQuestionsRepository.findCountByGameId(
      gameId,
      manager,
    );
    if (
      firstPlayerCount === totalQuestions &&
      secondPlayerCount < totalQuestions
    ) {
      return true;
    }
    if (
      secondPlayerCount === totalQuestions &&
      firstPlayerCount < totalQuestions
    ) {
      return false;
    }

    const firstPlayerLastAnswer =
      await this.answersRepository.getLastAnswerDate(
        firstPlayerId,
        gameId,
        manager,
      );
    const secondPlayerLastAnswer =
      await this.answersRepository.getLastAnswerDate(
        secondPlayerId,
        gameId,
        manager,
      );
    if (!firstPlayerLastAnswer) return false;
    if (!secondPlayerLastAnswer) return true;
    return firstPlayerLastAnswer.getTime() < secondPlayerLastAnswer.getTime();
  }

  private async determinePlayerStatus(
    firstPlayer: Player,
    secondPlayer: Player,
  ): Promise<void> {
    switch (true) {
      case firstPlayer.score > secondPlayer.score:
        firstPlayer.status = PlayerStatusEnum.WIN;
        secondPlayer.status = PlayerStatusEnum.LOSE;
        break;
      case secondPlayer.score > firstPlayer.score:
        firstPlayer.status = PlayerStatusEnum.LOSE;
        secondPlayer.status = PlayerStatusEnum.WIN;
        break;
      default:
        firstPlayer.status = PlayerStatusEnum.DRAW;
        secondPlayer.status = PlayerStatusEnum.DRAW;
    }
  }
}
