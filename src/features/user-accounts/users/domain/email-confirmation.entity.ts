import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/base.entity';

import { User } from './user.entity';
import { UuidProvider } from '../../../../core/helpers/uuid.provider';

@Entity()
export class EmailConfirmation extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  public confirmationCode: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  public expirationDate: Date | null;

  @OneToOne(() => User, (u) => u.emailConfirmation)
  @JoinColumn()
  public user: User;

  static create(
    uuidProvider: UuidProvider,
    expirationTime: number,
  ): EmailConfirmation {
    const emailConfirmation = new this();
    emailConfirmation.confirmationCode = uuidProvider.generate();
    emailConfirmation.expirationDate = new Date(Date.now() + expirationTime);
    return emailConfirmation;
  }
}
