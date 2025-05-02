import { Injectable } from '@nestjs/common';
import { SecurityDevices } from '../domain/security-devices.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectRepository(SecurityDevices)
    private readonly securityDevicesRepository: Repository<SecurityDevices>,
  ) {}

  async create(deviceSession: SecurityDevices) {
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

  async deleteById(deviceSession: SecurityDevices) {
    const result =
      await this.securityDevicesRepository.softRemove(deviceSession);
    if (!result) return null;
    return true;
  }
}
