import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';

export class UserInfoInputModel {
  @TrimIsString()
  user: string;

  @TrimIsString()
  deviceId: string;
}
