import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { EmailConfirmation } from './email-confirmation.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar', unique: true, collation: 'C' })
  public login: string;

  @Column({ type: 'varchar', unique: true })
  public password: string;

  @Column({ type: 'varchar', unique: true, collation: 'C' })
  public email: string;

  @Column({ type: 'boolean', default: false })
  public isConfirmed: boolean = false;

  @Column({ type: 'uuid', unique: true, nullable: true })
  public recoveryCode: string | null;

  @Column({ type: Date, nullable: true })
  public expirationRecoveryCode: Date | null;

  @OneToOne(() => EmailConfirmation, (e) => e.user)
  public emailConfirmation: EmailConfirmation;
}
