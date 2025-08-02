import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { PairGamesPublicController } from './pair-game/api/pair-games.public-controller';
import { QuestionsAdminController } from './questions/api/questions.admin-controller';
import { Question } from './questions/domain/questions.entity';
import { CreateQuestionUseCase } from './questions/application/use-cases/create-question.use-case';
import { QuestionsRepository } from './questions/infrastructure/questions.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { GetQuestionByIdQueryHandler } from './questions/application/queries/get-question-bu-id.query';
import { QuestionQueryRepository } from './questions/infrastructure/questions.query-repository';
import { GetQuestionsQueryHandler } from './questions/application/queries/get-questions.query';
import { UpdateQuestionUseCase } from './questions/application/use-cases/update-question.use-case';
import { UpdatePublishUseCase } from './questions/application/use-cases/update-publish.use-case';
import { DeleteQuestionUseCase } from './questions/application/use-cases/delete-question.use-case';
import { Player } from './pair-game/domain/player.entity';
import { Answer } from './pair-game/domain/answer.entity';
import { Game } from './pair-game/domain/game.entity';
import { GameQuestion } from './pair-game/domain/game-question.entity';
import { CreateConnectUseCase } from './pair-game/application/use-cases/create-connect.use-case';
import { GamesRepository } from './pair-game/infrastructure/games.repository';
import { GamesQueryRepository } from './pair-game/infrastructure/games.query-repository';
import { PlayersRepository } from './pair-game/infrastructure/players.repository';
import { GetPairGameByIdQueryHandler } from './pair-game/application/queries/get-pair-game-by-id.query';
import { GameQuestionsRepository } from './pair-game/infrastructure/game-questions.repository';
import { GetPairGameOfCurrentUserHandler } from './pair-game/application/queries/get-pair-game-of current-user.query';
import { CreateAnswerOfCurrentUserUseCase } from './pair-game/application/use-cases/create-answer-of-current-user.use-case';
import { AnswersRepository } from './pair-game/infrastructure/answers.repository';
import { GetAnswerResultQueryHandler } from './pair-game/application/queries/get-answer-result.query';
import { AnswersQueryRepository } from './pair-game/infrastructure/answers.query-repository';
import { GetMyGamesQueryHandler } from './pair-game/application/queries/get-my-games.query';
import { GetMyStatisticQueryHandler } from './pair-game/application/queries/get-my-statistic.query';

const controllers = [PairGamesPublicController, QuestionsAdminController];

const useCases = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  UpdatePublishUseCase,
  DeleteQuestionUseCase,
  CreateConnectUseCase,
  CreateAnswerOfCurrentUserUseCase,
];

const queries = [
  GetQuestionByIdQueryHandler,
  GetQuestionsQueryHandler,
  GetPairGameByIdQueryHandler,
  GetPairGameOfCurrentUserHandler,
  GetAnswerResultQueryHandler,
  GetMyGamesQueryHandler,
  GetMyStatisticQueryHandler,
];

const repositories = [
  QuestionsRepository,
  QuestionQueryRepository,
  GamesRepository,
  GamesQueryRepository,
  PlayersRepository,
  GameQuestionsRepository,
  AnswersRepository,
  AnswersQueryRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Player, Answer, Game, GameQuestion]),
    CqrsModule,
    UserAccountsModule,
  ],
  controllers: [...controllers],
  providers: [...useCases, ...queries, ...repositories],
})
export class QuizGameModule {}
