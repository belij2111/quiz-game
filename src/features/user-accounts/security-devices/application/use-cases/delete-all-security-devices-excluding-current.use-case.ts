import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesSqlRepository } from '../../infrastructure/security-devices.sql.repository';

export class DeleteAllSecurityDevicesExcludingCurrentCommand {
  constructor(
    public currentUserId: string,
    public currentDeviceId: string,
  ) {}
}

@CommandHandler(DeleteAllSecurityDevicesExcludingCurrentCommand)
export class DeleteAllSecurityDevicesExcludingCurrentUseCase
  implements
    ICommandHandler<DeleteAllSecurityDevicesExcludingCurrentCommand, boolean>
{
  constructor(
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(
    command: DeleteAllSecurityDevicesExcludingCurrentCommand,
  ): Promise<boolean> {
    return await this.securityDevicesSqlRepository.delete(
      command.currentUserId,
      command.currentDeviceId,
    );
  }
}
