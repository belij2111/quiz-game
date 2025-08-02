import { ApiProperty } from '@nestjs/swagger';

export class MyStatisticViewDto {
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

  static mapToView(statistic: MyStatisticViewDto): MyStatisticViewDto {
    const dto = new MyStatisticViewDto();
    dto.sumScore = statistic.sumScore;
    dto.avgScores = statistic.avgScores;
    dto.gamesCount = statistic.gamesCount;
    dto.winsCount = statistic.winsCount;
    dto.lossesCount = statistic.lossesCount;
    dto.drawsCount = statistic.drawsCount;
    return dto;
  }
}
