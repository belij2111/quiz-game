import { ApiProperty } from '@nestjs/swagger';

export class GameQuestionViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  body: string;
}
