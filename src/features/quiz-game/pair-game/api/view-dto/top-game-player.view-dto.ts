import { ApiProperty } from '@nestjs/swagger';
import { PlayerViewDto } from './player.view-dto';
import { MyStatisticViewDto } from './my-statistic.view-dto';

export class TopGamePlayerViewDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 0,
    description: 'Sum score of all games',
  })
  sumScore: number = 0;

  @ApiProperty({
    type: 'number',
    format: 'double',
    default: 0,
    description: 'Average score of all games rounded to 2 decimal place',
  })
  avgScores: number = 0;

  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 0,
    description: 'All played games count',
  })
  gamesCount: number = 0;

  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 0,
  })
  winsCount: number = 0;

  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 0,
  })
  lossesCount: number = 0;

  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 0,
  })
  drawsCount: number = 0;

  @ApiProperty({ type: PlayerViewDto })
  player: PlayerViewDto;

  static mapToView(
    statistic: MyStatisticViewDto,
    player: PlayerViewDto,
  ): TopGamePlayerViewDto {
    const dto = new TopGamePlayerViewDto();
    dto.sumScore = statistic.sumScore;
    dto.avgScores = statistic.avgScores;
    dto.gamesCount = statistic.gamesCount;
    dto.winsCount = statistic.winsCount;
    dto.lossesCount = statistic.lossesCount;
    dto.drawsCount = statistic.drawsCount;
    dto.player = {
      id: player.id,
      login: player.login,
    };
    return dto;
  }
}
