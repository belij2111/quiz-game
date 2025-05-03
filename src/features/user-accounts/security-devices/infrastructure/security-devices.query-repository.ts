import { Injectable } from '@nestjs/common';
import { SecurityDevicesViewModel } from '../api/models/view/security-devices.view.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityDevice } from '../domain/security-device.entity';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectRepository(SecurityDevice)
    private securityDevicesQueryRepository: Repository<SecurityDevice>,
  ) {}

  async getAll(currentUser: string): Promise<SecurityDevicesViewModel[]> {
    const devices = await this.findByUserId(currentUser);
    return devices.map(SecurityDevicesViewModel.mapToView);
  }

  async findByUserId(userId: string) {
    return await this.securityDevicesQueryRepository.find({
      where: { user: { id: userId } },
    });
  }
}
