import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationConfirmationCodeInputModel {
  @TrimIsString()
  @ApiProperty({ description: 'Code that be sent via Email inside link' })
  code: string;
}
