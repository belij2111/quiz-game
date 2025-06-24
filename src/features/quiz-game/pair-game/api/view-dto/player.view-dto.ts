import { ApiProperty } from '@nestjs/swagger';

export class PlayerViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  login: string;
}
