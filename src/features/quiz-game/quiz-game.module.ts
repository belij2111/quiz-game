import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { PairGamePublicController } from './pair-game/api/pair-game.public-controller';
import { QuestionsAdminController } from './questions/api/questions.admin-controller';

const controllers = [PairGamePublicController, QuestionsAdminController];

@Module({
  imports: [TypeOrmModule.forFeature([]), UserAccountsModule],
  controllers: [...controllers],
  providers: [],
})
export class QuizGameModule {}
