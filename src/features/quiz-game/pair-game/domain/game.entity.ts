import { BaseWithUuidIdEntity } from '../../../../core/entities/base-with-uuid-id.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { GameStatus } from '../api/enums/game-status.enum';
import { Player } from './player.entity';
import { GameQuestion } from './game-question.entity';

@Entity()
export class Game extends BaseWithUuidIdEntity {
  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.PENDING_SECOND_PLAYER,
  })
  status: GameStatus = GameStatus.PENDING_SECOND_PLAYER;

  @Column({ type: 'timestamp with time zone', nullable: true, default: null })
  startGameDate: Date | null = null;

  @Column({ type: 'timestamp with time zone', nullable: true, default: null })
  finishedGameDate: Date | null = null;

  @OneToOne(() => Player)
  @JoinColumn()
  firstPlayer: Player;
  @Column({ type: 'uuid' })
  firstPlayerId: string;

  @OneToOne(() => Player)
  @JoinColumn()
  secondPlayer: Player | null = null;
  @Column({ type: 'uuid', nullable: true })
  secondPlayerId: string | null = null;

  @OneToMany(() => GameQuestion, (gq) => gq.game)
  gameQuestions: GameQuestion[];

  static create(firstPlayerId: string): Game {
    const game = new this();
    game.firstPlayerId = firstPlayerId;
    game.gameQuestions = [];
    return game;
  }

  update(data: Partial<Game>) {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}
