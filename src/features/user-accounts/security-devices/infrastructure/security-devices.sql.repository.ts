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

  async update(deviceId: string, iatDate: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE "securityDevices"
      SET "iatDate" = $1
      WHERE "deviceId" = $2`,
      [iatDate, deviceId],
    );
    return result.rowCount !== 0;
  }

  async delete(currentUserId: string, currentDeviceId: string) {
    await this.dataSource.query(
      `DELETE FROM "securityDevices"
      WHERE "userId" = $1
      AND "deviceId" != $2
    `,
      [currentUserId, currentDeviceId],
    );
    return true;
  }

  async deleteById(deviceId: string) {
    const deletionResult = await this.dataSource.query(
      `DELETE FROM "securityDevices"
        WHERE "deviceId" = $1
      `,
      [deviceId],
    );
    return deletionResult[1] === 1;
  }

  async findById(deviceId: string) {
    const deletionResult = await this.dataSource.query(
      `SELECT * FROM "securityDevices"
      WHERE "deviceId" = $1`,
      [deviceId],
    );
    return deletionResult[0];
  }
}
