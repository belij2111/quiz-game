import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { PairGamePublicController } from './pair-game/api/pair-game.public-controller';

const controllers = [PairGamePublicController];

@Module({
  imports: [TypeOrmModule.forFeature([]), UserAccountsModule],
  controllers: [...controllers],
  providers: [],
})
export class QuizGameModule {}
