import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { SecurityDevicesSqlRepository } from '../../../security-devices/infrastructure/security-devices.sql.repository';

export class LogoutCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, boolean> {
  constructor(
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<boolean> {
    const foundDevice = await this.securityDevicesSqlRepository.findById(
      command.deviceId,
    );
    if (!foundDevice) {
      throw new NotFoundException('The device was not found');
    }
    return await this.securityDevicesSqlRepository.deleteById(
      foundDevice.deviceId,
    );
  }
}
