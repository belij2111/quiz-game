import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { EmailConfirmation } from './email-confirmation.entity';
import { UserCreateModel } from '../api/models/input/create-user.input-model';
import { UuidProvider } from '../../../../core/helpers/uuid.provider';
import { SecurityDevice } from '../../security-devices/domain/security-device.entity';
import { BaseWithUuidIdEntity } from '../../../../core/entities/base-with-uuid-id.entity';

@Entity()
export class User extends BaseWithUuidIdEntity {
  @Column({ type: 'varchar', unique: true, collation: 'C' })
  public login: string;

  @Column({ type: 'varchar', unique: true })
  public password: string;

  @Column({ type: 'varchar', unique: true, collation: 'C' })
  public email: string;

  @Column({ type: 'boolean', default: false })
  public isConfirmed: boolean = false;

  @Column({ type: 'varchar', unique: true, nullable: true })
  public recoveryCode?: string;

  @Column({ type: Date, nullable: true })
  public expirationRecoveryCode?: Date;

  @OneToOne(() => EmailConfirmation, (e) => e.user, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  public emailConfirmation: EmailConfirmation;

  @OneToMany(() => SecurityDevice, (sd) => sd.user, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  public securityDevice: SecurityDevice;

  static create(dto: UserCreateModel): User {
    const user = new this();
    user.login = dto.login;
    user.password = dto.password;
    user.email = dto.email;
    user.isConfirmed = true;
    return user;
  }
  static createWithConfirmation(
    dto: UserCreateModel,
    uuidProvider: UuidProvider,
    expirationTime: number,
  ) {
    const user = new this();
    user.login = dto.login;
    user.password = dto.password;
    user.email = dto.email;
    user.isConfirmed = false;
    user.emailConfirmation = EmailConfirmation.create(
      uuidProvider,
      expirationTime,
    );
    return user;
  }

  update(data: Partial<User>) {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}
