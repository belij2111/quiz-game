import { Injectable } from '@nestjs/common';
import { SecurityDevices } from '../domain/security-devices.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SecurityDevicesSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(deviceSession: SecurityDevices) {
    const result = await this.dataSource.query(
      `INSERT INTO "securityDevices"("userId","deviceId","ip","deviceName","iatDate","expDate")
values ($1, $2, $3, $4, $5,$6) RETURNING id `,
      [
        deviceSession.userId,
        deviceSession.deviceId,
        deviceSession.ip,
        deviceSession.deviceName,
        deviceSession.iatDate,
        deviceSession.expDate,
      ],
    );
    return result[0].id;
  }
}
