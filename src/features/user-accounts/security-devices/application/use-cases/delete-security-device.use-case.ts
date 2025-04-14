import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesSqlRepository } from '../../infrastructure/security-devices.sql.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteSecurityDeviceCommand {
  constructor(
    public currentUserId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteSecurityDeviceCommand)
export class DeleteSecurityDeviceUseCase
  implements ICommandHandler<DeleteSecurityDeviceCommand, boolean>
{
  constructor(
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(command: DeleteSecurityDeviceCommand): Promise<boolean> {
    const foundDevice = await this.securityDevicesSqlRepository.findById(
      command.deviceId,
    );
    if (!foundDevice) {
      throw new NotFoundException('The device was not found');
    }
    if (command.currentUserId !== foundDevice.userId) {
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
