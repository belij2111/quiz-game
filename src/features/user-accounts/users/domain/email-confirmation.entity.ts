import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { User } from './user.entity';
import { UuidProvider } from '../../../../core/helpers/uuid.provider';
import { BaseWithUuidIdEntity } from '../../../../core/entities/base-with-uuid-id.entity';

@Entity()
export class EmailConfirmation extends BaseWithUuidIdEntity {
  @Column({ type: 'varchar', nullable: true })
  public confirmationCode: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  public expirationDate: Date | null;

  @OneToOne(() => User, (u) => u.emailConfirmation)
  @JoinColumn()
  public user: User;
  @Column({ type: 'uuid' })
  public userId: string;

  static create(
    uuidProvider: UuidProvider,
    expirationTime: number,
  ): EmailConfirmation {
    const emailConfirmation = new this();
    emailConfirmation.confirmationCode = uuidProvider.generate();
    emailConfirmation.expirationDate = new Date(Date.now() + expirationTime);
    return emailConfirmation;
  }

  update(data: Partial<EmailConfirmation>) {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}
