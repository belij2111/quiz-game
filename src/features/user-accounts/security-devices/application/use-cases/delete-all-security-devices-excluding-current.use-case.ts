import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';

export class DeleteAllSecurityDevicesExcludingCurrentCommand {
  constructor(
    public currentUserId: string,
    public currentDeviceId: string,
  ) {}
}

@CommandHandler(DeleteAllSecurityDevicesExcludingCurrentCommand)
export class DeleteAllSecurityDevicesExcludingCurrentUseCase
  implements
    ICommandHandler<
      DeleteAllSecurityDevicesExcludingCurrentCommand,
      boolean | null
    >
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute(
    command: DeleteAllSecurityDevicesExcludingCurrentCommand,
  ): Promise<boolean | null> {
    return await this.securityDevicesRepository.delete(
      command.currentUserId,
      command.currentDeviceId,
    );
  }
}
