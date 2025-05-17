import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';

export class LoginInputModel {
  @TrimIsString()
  loginOrEmail: string;
  @TrimIsString()
  password: string;
}
