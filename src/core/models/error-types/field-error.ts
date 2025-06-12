import { ApiProperty } from '@nestjs/swagger';

export class FieldError {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Message with error explanation for certain field',
    required: false,
  })
  message: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'What field/property of input model has error',
    required: false,
  })
  field: string | null;
}
