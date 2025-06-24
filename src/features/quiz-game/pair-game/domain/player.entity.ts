import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseWithUuidIdEntity } from '../../../../core/entities/base-with-uuid-id.entity';
import { User } from '../../../user-accounts/users/domain/user.entity';
import { Answer } from './answer.entity';

@Entity()
export class Player extends BaseWithUuidIdEntity {
  @Column({ type: 'integer', nullable: true, default: 0 })
  public score: number = 0;

  @ManyToOne(() => User, (u) => u.player)
  user: User;
  @Column({ type: 'uuid' })
  public userId: string;

  @OneToMany(() => Answer, (a) => a.player, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  public answer: Answer[];

  static create(userId: string): Player {
    const player = new this();
    player.score = 0;
    player.userId = userId;
    return player;
  }

  update(data: Partial<Player>) {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}
