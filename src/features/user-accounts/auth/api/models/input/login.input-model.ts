import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { ApiProperty } from '@nestjs/swagger';

export class LoginInputModel {
  @ApiProperty()
  @TrimIsString()
  loginOrEmail: string;

  @ApiProperty()
  @TrimIsString()
  password: string;
}
