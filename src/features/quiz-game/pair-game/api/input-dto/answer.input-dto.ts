import { ApiProperty } from '@nestjs/swagger';

export class AnswerInputDto {
  @ApiProperty()
  answer: string;
}
