import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnswerInputDto } from '../../api/input-dto/answer.input-dto';
import { GamesRepository } from '../../infrastructure/games.repository';
import { PlayersRepository } from '../../infrastructure/players.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GameQuestionsRepository } from '../../infrastructure/game-questions.repository';
import { AnswerStatus } from '../../api/enums/answer-status.enum';
import { AnswersRepository } from '../../infrastructure/answers.repository';
import { Answer } from '../../domain/answer.entity';
import { Game } from '../../domain/game.entity';
import { GameStatus } from '../../api/enums/game-status.enum';
import { PlayerStatusEnum } from '../../api/enums/player-status.enum';
import { Player } from '../../domain/player.entity';
import { DataSource, EntityManager } from 'typeorm';

const SCORE_INCREMENT = 1;
const BONUS_SCORE = 1;

export class CreateAnswerOfCurrentUserCommand {
  constructor(
    public currentUserId: string,
    public answerInputDto: AnswerInputDto,
  ) {}
}

@CommandHandler(CreateAnswerOfCurrentUserCommand)
export class CreateAnswerOfCurrentUserUseCase
  implements ICommandHandler<CreateAnswerOfCurrentUserCommand, string>
{
  constructor(
    public readonly dataSource: DataSource,
    private readonly gamesRepository: GamesRepository,
    private readonly playersRepository: PlayersRepository,
    private readonly gameQuestionsRepository: GameQuestionsRepository,
    private readonly answersRepository: AnswersRepository,
  ) {}

  async execute(command: CreateAnswerOfCurrentUserCommand): Promise<string> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const { currentUserId, answerInputDto } = command;
      const activeGame = await this.gamesRepository.findActiveGameByUserId(
        currentUserId,
        manager,
      );
      if (!activeGame) {
        throw new ForbiddenException('User is not in an active pair');
      }
      const player = await this.playersRepository.findByUserIdAndByGameId(
        currentUserId,
        activeGame.id,
        manager,
      );
      if (!player) {
        throw new NotFoundException(`Player not found`);
      }
      const totalQuestions =
        await this.gameQuestionsRepository.findCountByGameId(
          activeGame.id,
          manager,
        );
      const playerAnswersCount =
        await this.answersRepository.getCountByPlayerId(player.id, manager);
      if (playerAnswersCount >= totalQuestions) {
        throw new ForbiddenException('User has already answered all questions');
      }
      const nextQuestion = await this.gameQuestionsRepository.findNextQuestion(
        activeGame.id,
        player.id,
        manager,
      );
      if (!nextQuestion) {
        throw new ForbiddenException('No questions to answer');
      }
      const isCorrect = nextQuestion.question.correctAnswers.includes(
        answerInputDto.answer,
      );
      const answerStatus = isCorrect
        ? AnswerStatus.CORRECT
        : AnswerStatus.INCORRECT;
      const answer = Answer.create(
        { answerStatus: answerStatus },
        player.id,
        nextQuestion.questionId,
      );
      await this.answersRepository.create(answer, manager);
      if (isCorrect) {
        player.score += SCORE_INCREMENT;
        await this.playersRepository.update(player, manager);
      }
      const isGameFinished = await this.checkAllQuestionsAnswered(
        activeGame,
        manager,
      );
      if (isGameFinished) {
        await this.finishGame(activeGame, manager);
      }
      return answer.id;
    });
  }

  private async checkAllQuestionsAnswered(
    game: Game,
    manager: EntityManager,
  ): Promise<boolean> {
    const questions = await this.gameQuestionsRepository.findByGameId(
      game.id,
      manager,
    );
    const firstPlayerAnswersCount =
      await this.answersRepository.getCountByPlayerId(
        game.firstPlayerId,
        manager,
      );
    const secondPlayerAnswersCount =
      await this.answersRepository.getCountByPlayerId(
        game.secondPlayerId!,
        manager,
      );
    return (
      questions.length === firstPlayerAnswersCount &&
      questions.length === secondPlayerAnswersCount
    );
  }

  private async finishGame(game: Game, manager: EntityManager): Promise<void> {
    const firstPlayer = await this.playersRepository.findByIdOrNotFoundFail(
      game.firstPlayerId,
      manager,
    );
    const secondPlayer = await this.playersRepository.findByIdOrNotFoundFail(
      game.secondPlayerId!,
      manager,
    );
    const isFirstPlayerCorrectAnswers: boolean =
      await this.answersRepository.hasAtLeastOneCorrectAnswer(
        game.firstPlayerId,
        manager,
      );
    const isSecondPlayerCorrectAnswers: boolean =
      await this.answersRepository.hasAtLeastOneCorrectAnswer(
        game.secondPlayerId!,
        manager,
      );
    const firstPlayerFinishedFirst: boolean =
      await this.checkFirstPlayerFinishedFirst(
        game.firstPlayerId,
        game.secondPlayerId!,
        game.id,
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

    game.update({
      status: GameStatus.FINISHED,
      finishedGameDate: new Date(),
    });
    await this.gamesRepository.update(game, manager);
  }

  private async checkFirstPlayerFinishedFirst(
    firstPlayerId: string,
    secondPlayerId: string,
    gameId: string,
    manager: EntityManager,
  ): Promise<boolean> {
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
