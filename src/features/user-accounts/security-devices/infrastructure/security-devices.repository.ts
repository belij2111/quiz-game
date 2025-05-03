import { Injectable } from '@nestjs/common';
import { SecurityDevice } from '../domain/security-device.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectRepository(SecurityDevice)
    private readonly securityDevicesRepository: Repository<SecurityDevice>,
  ) {}

  async create(deviceSession: SecurityDevice) {
    await this.securityDevicesRepository.save(deviceSession);
  }

  async update(deviceId: string, iatDate: Date) {
    await this.securityDevicesRepository.update(
      { deviceId: deviceId },
      { iatDate: iatDate },
    );
  }

  async findById(deviceId: string) {
    return await this.securityDevicesRepository.findOne({
      where: { deviceId: deviceId },
      relations: { user: true },
    });
  }

  async deleteById(deviceSession: SecurityDevice) {
    const result =
      await this.securityDevicesRepository.softRemove(deviceSession);
    if (!result) return null;
    return true;
  }

  async delete(currentUserId: string, currentDeviceId: string) {
    const devicesToDelete = await this.securityDevicesRepository.find({
      where: { user: { id: currentUserId }, deviceId: Not(currentDeviceId) },
    });
    const result =
      await this.securityDevicesRepository.softRemove(devicesToDelete);
    if (!result) return null;
    return true;
  }
}
