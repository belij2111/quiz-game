import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';

export class LogoutCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase
  implements ICommandHandler<LogoutCommand, boolean | null>
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<boolean | null> {
    const foundDevice = await this.securityDevicesRepository.findById(
      command.deviceId,
    );
    if (!foundDevice) {
      throw new NotFoundException('The device was not found');
    }
    return await this.securityDevicesRepository.deleteById(foundDevice);
  }
}
