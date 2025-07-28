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
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

const QUESTIONS_COUNT = 5;

export class CreateConnectCommand {
  constructor(public currentUserId: string) {}
}

@CommandHandler(CreateConnectCommand)
export class CreateConnectUseCase
  implements ICommandHandler<CreateConnectCommand, string>
{
  constructor(
    @InjectDataSource() public readonly dataSource: DataSource,
    public readonly playersRepository: PlayersRepository,
    public readonly gamesRepository: GamesRepository,
    public readonly questionsRepository: QuestionsRepository,
    public readonly gameQuestionsRepository: GameQuestionsRepository,
  ) {}

  async execute(command: CreateConnectCommand): Promise<string> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const { currentUserId } = command;
      const foundPendingGame = await this.gamesRepository.findByStatus(
        GameStatus.PENDING_SECOND_PLAYER,
      );
      const foundActiveCame =
        await this.gamesRepository.findActiveGameByUserId(currentUserId);
      if (foundActiveCame) {
        throw new ForbiddenException(
          'User is already participating in active pair',
        );
      }
      if (foundPendingGame) {
        const firstPlayer = await this.playersRepository.findById(
          foundPendingGame.firstPlayerId,
        );
        if (firstPlayer?.userId === currentUserId) {
          throw new ForbiddenException(
            'User cannot connect to his own pending game',
          );
        }
        const createdSecondPlayer = await this.createPlayer(
          currentUserId,
          manager,
        );
        return await this.connectToExistingGame(
          foundPendingGame,
          createdSecondPlayer.id,
          manager,
        );
      }
      const createdFirstPlayer = await this.createPlayer(
        currentUserId,
        manager,
      );
      return await this.createNewGame(createdFirstPlayer.id, manager);
    });
  }

  private async connectToExistingGame(
    game: Game,
    playerId: string,
    manager?: EntityManager,
  ): Promise<string> {
    await this.addRandomQuestions(game, QUESTIONS_COUNT, manager);
    game.update({
      secondPlayerId: playerId,
      status: GameStatus.ACTIVE,
      startGameDate: new Date(),
    });
    return await this.gamesRepository.save(game, manager);
  }

  private async createPlayer(
    userId: string,
    manager?: EntityManager,
  ): Promise<Player> {
    const player = Player.create(userId);
    return await this.playersRepository.create(player, manager);
  }

  private async createNewGame(
    playerId: string,
    manager?: EntityManager,
  ): Promise<string> {
    const game = Game.create(playerId);
    return await this.gamesRepository.save(game, manager);
  }

  private async addRandomQuestions(
    game: Game,
    count: number,
    manager?: EntityManager,
  ) {
    const foundRandomQuestions =
      await this.questionsRepository.findRandomPublishedQuestions(
        count,
        manager,
      );
    const savePromises = foundRandomQuestions.map(async (question) => {
      const gameQuestion = new GameQuestion();
      gameQuestion.gameId = game.id;
      gameQuestion.questionId = question.id;
      return this.gameQuestionsRepository.create(gameQuestion, manager);
    });
    await Promise.all(savePromises);
  }
}
