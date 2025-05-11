import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { BaseWithUuidIdEntity } from '../../../../core/entities/base-with-uuid-id.entity';

@Entity()
export class SecurityDevice extends BaseWithUuidIdEntity {
  @Column({ type: 'uuid', unique: true })
  public deviceId: string;

  @Column({ type: 'varchar' })
  public ip: string;

  @Column({ type: 'varchar' })
  public deviceName: string;

  @Column({ type: 'timestamp with time zone' })
  public iatDate: Date;

  @Column({ type: 'timestamp with time zone' })
  public expDate: Date;

  @ManyToOne(() => User, (u) => u.securityDevice)
  @JoinColumn()
  public user: User;
  @Column({ type: 'uuid' })
  public userId: string;

  static create(
    userId: string,
    deviceId: string,
    ip: string,
    deviceName: string,
    iatDate: number,
    expDate: number,
  ): SecurityDevice {
    const deviceSession = new this();
    deviceSession.userId = userId;
    deviceSession.deviceId = deviceId;
    deviceSession.ip = ip;
    deviceSession.deviceName = deviceName;
    deviceSession.iatDate = new Date(iatDate * 1000);
    deviceSession.expDate = new Date(expDate * 1000);
    return deviceSession;
  }
}
