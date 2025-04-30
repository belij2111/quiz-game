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
}
