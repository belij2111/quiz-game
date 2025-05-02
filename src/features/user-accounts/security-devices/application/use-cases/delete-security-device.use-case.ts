import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';

export class DeleteSecurityDeviceCommand {
  constructor(
    public currentUserId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteSecurityDeviceCommand)
export class DeleteSecurityDeviceUseCase
  implements ICommandHandler<DeleteSecurityDeviceCommand, boolean | null>
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute(command: DeleteSecurityDeviceCommand): Promise<boolean | null> {
    const foundDevice = await this.securityDevicesRepository.findById(
      command.deviceId,
    );
    if (!foundDevice) {
      throw new NotFoundException('The device was not found');
    }
    if (command.currentUserId !== foundDevice.user.id) {
      throw new ForbiddenException([
        {
          field: 'device',
          message: "You cannot delete another user's device ID",
        },
      ]);
    }
    return await this.securityDevicesRepository.deleteById(foundDevice);
  }
}
