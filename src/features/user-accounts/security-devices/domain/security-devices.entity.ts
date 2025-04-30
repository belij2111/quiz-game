import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { User } from '../../users/domain/user.entity';

@Entity('security-devices')
export class SecurityDevices extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  public deviceId: string;

  @Column({ type: 'varchar' })
  public ip: string;

  @Column({ type: 'varchar', nullable: true })
  public deviceName: string;

  @Column({ type: 'timestamp with time zone' })
  public iatDate: Date;

  @Column({ type: 'timestamp with time zone' })
  public expDate: Date;

  @ManyToOne(() => User, (u) => u.securityDevices)
  @JoinColumn({ name: 'userId' })
  public user: User;

  static create(
    userId: string,
    deviceId: string,
    ip: string,
    deviceName: string,
    iatDate: number,
    expDate: number,
  ): SecurityDevices {
    const deviceSession = new this();
    deviceSession.user = { id: userId } as User;
    deviceSession.deviceId = deviceId;
    deviceSession.ip = ip;
    deviceSession.iatDate = new Date(iatDate * 1000);
    deviceSession.expDate = new Date(expDate * 1000);
    return deviceSession;
  }
}
