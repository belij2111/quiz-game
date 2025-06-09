import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationConfirmationCodeInputModel {
  @TrimIsString()
  @ApiProperty()
  code: string;
}
