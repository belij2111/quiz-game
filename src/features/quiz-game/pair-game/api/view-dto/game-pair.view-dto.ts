import { ApiProperty } from '@nestjs/swagger';
import { GamePlayerProgressViewDto } from './game-player-progress.view-dto';
import { GameStatus } from '../enums/game-status.enum';

export class GamePairViewDto {
  @ApiProperty({ type: 'string', format: 'uuid', description: 'Id of pair' })
  id: string;

  @ApiProperty({ type: GamePlayerProgressViewDto })
  firstPlayerProgress: GamePlayerProgressViewDto;

  @ApiProperty({ type: GamePlayerProgressViewDto, required: false })
  secondPlayerProgress: GamePlayerProgressViewDto;

  @ApiProperty({
    type: [String],
    nullable: true,
    description: `Questions for both players (can be null if second player haven't connected yet)`,
    required: false,
  })
  questions: string[] | null = null;

  @ApiProperty({ enum: GameStatus, required: false })
  status: GameStatus;

  @ApiProperty({
    format: 'date-time',
    required: false,
    description: 'Date when first player initialized the pair',
  })
  pairCreatedDate: string;

  @ApiProperty({
    format: 'date-time',
    required: false,
    description:
      'Game starts immediately after second player connection to this pair',
    nullable: true,
  })
  startGameDate: string;

  @ApiProperty({
    format: 'date-time',
    required: false,
    description:
      'Game finishes immediately after both players have all the questions',
    nullable: true,
  })
  finishedGameDate: string;
}
