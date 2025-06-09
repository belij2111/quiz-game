import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordRecoveryInputModel {
  @TrimIsString()
  @IsEmail()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'email should follow the pattern: example@example.com',
  })
  @ApiProperty()
  email: string;
}
