import { ApiProperty } from '@nestjs/swagger';
import { GamePlayerProgressViewDto } from './game-player-progress.view-dto';
import { GameStatus } from '../enums/game-status.enum';
import { GameQuestionViewDto } from './game-question.view-dto';
import { GameRawDataDto } from '../../infrastructure/dto/game-raw-data.dto';

export class GamePairViewDto {
  @ApiProperty({ type: 'string', format: 'uuid', description: 'Id of pair' })
  id: string;

  @ApiProperty({ type: GamePlayerProgressViewDto })
  firstPlayerProgress: GamePlayerProgressViewDto;

  @ApiProperty({
    type: GamePlayerProgressViewDto,
    required: false,
    nullable: true,
  })
  secondPlayerProgress: GamePlayerProgressViewDto | null = null;

  @ApiProperty({
    type: [GameQuestionViewDto],
    nullable: true,
    description: `Questions for both players (can be null if second player haven't connected yet)`,
    required: false,
  })
  questions: GameQuestionViewDto[] | null = null;

  @ApiProperty({ enum: GameStatus, required: false })
  status: GameStatus;

  @ApiProperty({
    format: 'date-time',
    required: false,
    description: 'Date when first player initialized the pair',
  })
  pairCreatedDate: string;

  @ApiProperty({
    format: 'date-time',
    required: false,
    description:
      'Game starts immediately after second player connection to this pair',
    nullable: true,
  })
  startGameDate: string | null = null;

  @ApiProperty({
    format: 'date-time',
    required: false,
    description:
      'Game finishes immediately after both players have all the questions',
    nullable: true,
  })
  finishGameDate: string | null = null;

  static mapToView(game: GameRawDataDto): GamePairViewDto {
    const dto = new GamePairViewDto();
    dto.id = game.id;
    dto.firstPlayerProgress = {
      answers: (game.firstPlayerProgress?.answers || []).map((answer) => ({
        questionId: answer.questionId,
        answerStatus: answer.answerStatus,
        addedAt: new Date(answer.addedAt).toISOString(),
      })),
      player: {
        id: game.firstPlayerProgress?.player?.id || '',
        login: game.firstPlayerProgress?.player?.login || '',
      },
      score: game.firstPlayerProgress?.score || 0,
    };
    dto.secondPlayerProgress = game.secondPlayerProgress
      ? {
          answers: game.secondPlayerProgress.answers.map((answer) => ({
            questionId: answer.questionId,
            answerStatus: answer.answerStatus,
            addedAt: new Date(answer.addedAt).toISOString(),
          })),
          player: {
            id: game.secondPlayerProgress.player.id,
            login: game.secondPlayerProgress.player.login,
          },
          score: game.secondPlayerProgress.score,
        }
      : null;
    dto.questions = game.questions?.length
      ? game.questions.map((question) => ({
          id: question.id,
          body: question.body,
        }))
      : null;
    dto.status = game.status;
    dto.pairCreatedDate = game.pairCreatedDate.toISOString();
    dto.startGameDate = game.startGameDate
      ? game.startGameDate.toISOString()
      : null;
    dto.finishGameDate = game.finishedGameDate
      ? game.finishedGameDate.toISOString()
      : null;
    return dto;
  }
}
