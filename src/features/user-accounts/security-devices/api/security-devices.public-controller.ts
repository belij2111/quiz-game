import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../../../../core/decorators/param/current-user-id.param-decorator';
import { RefreshTokenGuard } from '../../guards/refresh-token.guard';
import { CurrentDeviceId } from '../../../../core/decorators/param/current-device-id.param-decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DeleteAllSecurityDevicesExcludingCurrentCommand } from '../application/use-cases/delete-all-security-devices-excluding-current.use-case';
import { DeleteSecurityDeviceCommand } from '../application/use-cases/delete-security-device.use-case';
import { GetDevicesQuery } from '../application/queries/get-devices.query';

@Controller('security')
export class SecurityDevicesPublicController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('devices')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async getAll(@CurrentUserId() currentUserId: string) {
    return await this.queryBus.execute(new GetDevicesQuery(currentUserId));
  }

  @Delete('devices')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUserId() currentUserId: string,
    @CurrentDeviceId() currentDeviceId: string,
  ) {
    await this.commandBus.execute(
      new DeleteAllSecurityDevicesExcludingCurrentCommand(
        currentUserId,
        currentDeviceId,
      ),
    );
  }

  @Delete('devices/:deviceId')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(
    @CurrentUserId() currentUserId: string,
    @Param('deviceId') deviceId: string,
  ) {
    await this.commandBus.execute(
      new DeleteSecurityDeviceCommand(currentUserId, deviceId),
    );
  }
}
