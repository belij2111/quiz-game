import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { Length } from 'class-validator';

export class NewPasswordRecoveryInputModel {
  @TrimIsString()
  @Length(6, 20, {
    message: 'password length should be from 6 to 20 symbols',
  })
  newPassword: string;

  @TrimIsString()
  recoveryCode: string;
}
