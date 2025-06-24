import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { PairGamePublicController } from './pair-game/api/pair-game.public-controller';
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

const controllers = [PairGamePublicController, QuestionsAdminController];

const useCases = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  UpdatePublishUseCase,
  DeleteQuestionUseCase,
];

const queries = [GetQuestionByIdQueryHandler, GetQuestionsQueryHandler];

const repositories = [QuestionsRepository, QuestionQueryRepository];

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Player, Answer]),
    CqrsModule,
    UserAccountsModule,
  ],
  controllers: [...controllers],
  providers: [...useCases, ...queries, ...repositories],
})
export class QuizGameModule {}
