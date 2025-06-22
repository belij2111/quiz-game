import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdatePublishInputDto {
  @ApiProperty({
    type: Boolean,
    required: false,
    description:
      'True if question is completed and can be used in the Quiz game',
  })
  @IsBoolean()
  published: boolean;
}
