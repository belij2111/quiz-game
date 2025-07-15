import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesRepository } from '../../infrastructure/games.repository';
import { PlayersRepository } from '../../infrastructure/players.repository';
import { Player } from '../../domain/player.entity';
import { Game } from '../../domain/game.entity';
import { GameStatus } from '../../api/enums/game-status.enum';
import { ForbiddenException } from '@nestjs/common';
import { QuestionsRepository } from '../../../questions/infrastructure/questions.repository';
import { GameQuestion } from '../../domain/game-question.entity';
import { GameQuestionsRepository } from '../../infrastructure/game-questions.repository';

const QUESTIONS_COUNT = 5;

export class CreateConnectCommand {
  constructor(public currentUserId: string) {}
}

@CommandHandler(CreateConnectCommand)
export class CreateConnectUseCase
  implements ICommandHandler<CreateConnectCommand, string>
{
  constructor(
    public readonly playersRepository: PlayersRepository,
    public readonly gamesRepository: GamesRepository,
    public readonly questionsRepository: QuestionsRepository,
    public readonly gameQuestionsRepository: GameQuestionsRepository,
  ) {}

  async execute(command: CreateConnectCommand): Promise<string> {
    const foundPendingGame = await this.gamesRepository.findByStatus(
      GameStatus.PENDING_SECOND_PLAYER,
    );
    const player = await this.playersRepository.findByUserId(
      command.currentUserId,
    );
    if (player) {
      const foundActiveCame =
        await this.gamesRepository.findActiveGameByPlayerId(player.id);
      if (
        foundActiveCame ||
        (foundPendingGame && foundPendingGame.firstPlayerId === player.id)
      ) {
        throw new ForbiddenException(
          'User is already participating in active pair',
        );
      }
      if (foundPendingGame && foundPendingGame.firstPlayerId !== player.id) {
        return await this.connectToExistingGame(foundPendingGame, player.id);
      }
      if (!foundPendingGame) {
        return await this.createNewGame(player.id);
      }
    }
    const createdPlayer = await this.createPlayer(command.currentUserId);
    if (foundPendingGame) {
      return await this.connectToExistingGame(
        foundPendingGame,
        createdPlayer.id,
      );
    }
    return await this.createNewGame(createdPlayer.id);
  }

  private async connectToExistingGame(
    game: Game,
    playerId: string,
  ): Promise<string> {
    await this.addRandomQuestions(game, QUESTIONS_COUNT);
    game.update({
      secondPlayerId: playerId,
      status: GameStatus.ACTIVE,
      startGameDate: new Date(),
    });
    return await this.gamesRepository.save(game);
  }

  private async createPlayer(userId: string): Promise<Player> {
    const player = Player.create(userId);
    return await this.playersRepository.create(player);
  }

  private async createNewGame(playerId: string): Promise<string> {
    const game = Game.create(playerId);
    return await this.gamesRepository.save(game);
  }

  private async addRandomQuestions(game: Game, count: number) {
    const foundRandomQuestions =
      await this.questionsRepository.findRandomPublishedQuestions(count);
    const savePromises = foundRandomQuestions.map(async (question) => {
      const gameQuestion = new GameQuestion();
      gameQuestion.gameId = game.id;
      gameQuestion.questionId = question.id;
      return this.gameQuestionsRepository.create(gameQuestion);
    });
    await Promise.all(savePromises);
  }
}
