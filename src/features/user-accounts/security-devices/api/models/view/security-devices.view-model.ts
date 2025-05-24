import { SecurityDeviceRawDataDto } from '../../../dto/security-device-raw-data.dto';

export class SecurityDevicesViewModel {
  ip: string;
  title: string;
  lastActiveDate: Date;
  deviceId: string;

  static mapToView(
    devices: SecurityDeviceRawDataDto,
  ): SecurityDevicesViewModel {
    const model = new SecurityDevicesViewModel();
    model.ip = devices.ip;
    model.title = devices.deviceName;
    model.lastActiveDate = devices.iatDate;
    model.deviceId = devices.deviceId;
    return model;
  }
}
