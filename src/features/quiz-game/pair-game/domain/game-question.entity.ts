import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { Game } from './game.entity';
import { Question } from '../../questions/domain/questions.entity';

@Entity()
export class GameQuestion extends BaseEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @ManyToOne(() => Game, (g) => g.gameQuestions)
  game: Game;
  @Column({ type: 'uuid' })
  gameId: string;

  @ManyToOne(() => Question)
  question: Question;
  @Column({ type: 'uuid' })
  questionId: string;
}
