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
    private readonly gamesRepository: GamesRepository,
    private readonly playersRepository: PlayersRepository,
    private readonly gameQuestionsRepository: GameQuestionsRepository,
    private readonly answersRepository: AnswersRepository,
  ) {}

  async execute(command: CreateAnswerOfCurrentUserCommand): Promise<string> {
    const { currentUserId, answerInputDto } = command;
    const activeGame =
      await this.gamesRepository.findActiveGameByUserId(currentUserId);
    if (!activeGame) {
      throw new ForbiddenException('User is not in an active pair');
    }
    const player = await this.playersRepository.findByUserIdAndByGameId(
      currentUserId,
      activeGame.id,
    );
    if (!player) {
      throw new NotFoundException(`Player not found`);
    }
    const totalQuestions = await this.gameQuestionsRepository.findCountByGameId(
      activeGame.id,
    );
    const playerAnswersCount = await this.answersRepository.getCountByPlayerId(
      player.id,
    );
    if (playerAnswersCount >= totalQuestions) {
      throw new ForbiddenException('User has already answered all questions');
    }
    const nextQuestion = await this.gameQuestionsRepository.findNextQuestion(
      activeGame.id,
      player.id,
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
    await this.answersRepository.create(answer);
    if (isCorrect) {
      player.score += SCORE_INCREMENT;
      await this.playersRepository.update(player);
    }
    const isGameFinished = await this.checkAllQuestionsAnswered(activeGame);
    if (isGameFinished) {
      await this.finishGame(activeGame);
    }
    return answer.id;
  }

  private async checkAllQuestionsAnswered(game: Game): Promise<boolean> {
    const questions = await this.gameQuestionsRepository.findByGameId(game.id);
    const firstPlayerAnswersCount =
      await this.answersRepository.getCountByPlayerId(game.firstPlayerId);
    const secondPlayerAnswersCount =
      await this.answersRepository.getCountByPlayerId(game.secondPlayerId!);
    return (
      questions.length === firstPlayerAnswersCount &&
      questions.length === secondPlayerAnswersCount
    );
  }

  private async finishGame(game: Game): Promise<void> {
    const firstPlayer = await this.playersRepository.findByIdOrNotFoundFail(
      game.firstPlayerId,
    );
    const secondPlayer = await this.playersRepository.findByIdOrNotFoundFail(
      game.secondPlayerId!,
    );
    const isFirstPlayerCorrectAnswers: boolean =
      await this.answersRepository.hasAtLeastOneCorrectAnswer(
        game.firstPlayerId,
      );
    const isSecondPlayerCorrectAnswers: boolean =
      await this.answersRepository.hasAtLeastOneCorrectAnswer(
        game.secondPlayerId!,
      );
    const firstPlayerFinishedFirst: boolean =
      await this.checkFirstPlayerFinishedFirst(
        game.firstPlayerId,
        game.secondPlayerId!,
        game.id,
      );
    if (isFirstPlayerCorrectAnswers && firstPlayerFinishedFirst) {
      firstPlayer.score += BONUS_SCORE;
    }
    if (isSecondPlayerCorrectAnswers && !firstPlayerFinishedFirst) {
      secondPlayer.score += BONUS_SCORE;
    }
    await this.playersRepository.update(firstPlayer);
    await this.playersRepository.update(secondPlayer);

    game.update({
      status: GameStatus.FINISHED,
      finishedGameDate: new Date(),
    });
    await this.gamesRepository.update(game);
  }

  private async checkFirstPlayerFinishedFirst(
    firstPlayerId: string,
    secondPlayerId: string,
    gameId: string,
  ): Promise<boolean> {
    const firstPlayerLastAnswer =
      await this.answersRepository.getLastAnswerDate(firstPlayerId, gameId);
    const secondPlayerLastAnswer =
      await this.answersRepository.getLastAnswerDate(secondPlayerId, gameId);
    if (!firstPlayerLastAnswer) return false;
    if (!secondPlayerLastAnswer) return true;
    return firstPlayerLastAnswer.getTime() < secondPlayerLastAnswer.getTime();
  }
}
