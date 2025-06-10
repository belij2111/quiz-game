import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const EMAIL_PATTERN = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export class PasswordRecoveryInputModel {
  @TrimIsString()
  @IsEmail()
  @Matches(EMAIL_PATTERN, {
    message: 'email should follow the pattern: example@example.com',
  })
  @ApiProperty({
    pattern: `${EMAIL_PATTERN}`,
    example: 'example@example.com',
    description: 'Email of registered user',
  })
  email: string;
}
