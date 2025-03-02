import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SecurityDevicesSqlRepository } from '../infrastructure/security-devices.sql.repository';

@Injectable()
export class SecurityDevicesService {
  constructor(
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async delete(
    currentUserId: string,
    currentDeviceId: string,
  ): Promise<boolean> {
    return await this.securityDevicesSqlRepository.delete(
      currentUserId,
      currentDeviceId,
    );
  }

  async deleteById(currentUserId: string, deviceId: string) {
    const foundDevice =
      await this.securityDevicesSqlRepository.findById(deviceId);
    if (!foundDevice) {
      throw new NotFoundException('The device was not found');
    }
    if (currentUserId !== foundDevice.userId) {
      throw new ForbiddenException([
        {
          field: 'device',
          message: "You cannot delete another user's device ID",
        },
      ]);
    }
    return await this.securityDevicesSqlRepository.deleteById(
      foundDevice.deviceId,
    );
  }
}
