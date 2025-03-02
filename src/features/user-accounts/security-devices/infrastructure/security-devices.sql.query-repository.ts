import { Injectable } from '@nestjs/common';
import { SecurityDevicesViewModel } from '../api/models/view/security-devices.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SecurityDevicesSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAll(currentUser: string): Promise<SecurityDevicesViewModel[]> {
    const devices = await this.findByUserId(currentUser);
    return devices.map(SecurityDevicesViewModel.mapToView);
  }

  async findByUserId(userId: string) {
    return await this.dataSource.query(
      `SELECT * FROM "securityDevices"
        WHERE "userId" = $1
      `,
      [userId],
    );
  }
}
