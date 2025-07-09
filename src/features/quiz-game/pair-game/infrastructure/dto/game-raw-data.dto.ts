import { AnswerStatus } from '../../api/enums/answer-status.enum';
import { GameStatus } from '../../api/enums/game-status.enum';

export class GameRawDataDto {
  id: string;
  firstPlayerProgress: {
    answers: {
      questionId: string;
      answerStatus: AnswerStatus;
      addedAt: Date;
    }[];
    player: {
      id: string;
      login: string;
    };
    score: number;
  };
  secondPlayerProgress: {
    answers: {
      questionId: string;
      answerStatus: AnswerStatus;
      addedAt: Date;
    }[];
    player: {
      id: string;
      login: string;
    };
    score: number;
  } | null;
  questions: {
    id: string;
    body: string;
  }[];
  status: GameStatus;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishedGameDate: Date | null;
}
