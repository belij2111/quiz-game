import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const NEW_PASSWORD_MIN_LENGTH = 6;
const NEW_PASSWORD_MAX_LENGTH = 20;

export class NewPasswordRecoveryInputModel {
  @TrimIsString()
  @Length(NEW_PASSWORD_MIN_LENGTH, NEW_PASSWORD_MAX_LENGTH, {
    message: 'password length should be from 6 to 20 symbols',
  })
  @ApiProperty({
    minLength: NEW_PASSWORD_MIN_LENGTH,
    maxLength: NEW_PASSWORD_MAX_LENGTH,
  })
  newPassword: string;

  @TrimIsString()
  @ApiProperty()
  recoveryCode: string;
}
