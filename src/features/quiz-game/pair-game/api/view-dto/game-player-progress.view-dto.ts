import { ApiProperty } from '@nestjs/swagger';
import { AnswerViewDto } from './answer.view-dto';
import { PlayerViewDto } from './player.view-dto';

export class GamePlayerProgressViewDto {
  @ApiProperty({ type: [AnswerViewDto] })
  answers: AnswerViewDto[];

  @ApiProperty({ type: PlayerViewDto })
  player: PlayerViewDto;

  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    default: 0,
    description: 'Player score',
  })
  score: number = 0;
}
