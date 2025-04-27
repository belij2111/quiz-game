import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/base.entity';

import { User } from './user.entity';

@Entity('email-confirmations')
export class EmailConfirmation extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  public confirmationCode: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  public expirationDate: Date | null;

  @OneToOne(() => User, (u) => u.emailConfirmation)
  @JoinColumn()
  public user: User;
}
