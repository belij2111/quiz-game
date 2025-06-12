import { ApiProperty } from '@nestjs/swagger';
import { FieldError } from './field-error';

export class ApiErrorResult {
  @ApiProperty({ nullable: true, type: [FieldError], required: false })
  errorsMessages: FieldError[] | null;
}
