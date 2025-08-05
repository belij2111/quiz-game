import { PaginationParams } from '../../../../../core/models/base-query-params.input-model';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export enum TopUsersSortBy {
  AVG_SCORES = 'avgScores',
  SUM_SCORES = 'sumScore',
  WINS_COUNT = 'winsCount',
  LOSSES_COUNT = 'lossesCount',
  DRAWS_COUNT = 'drawsCount',
  GAMES_COUNT = 'gamesCount',
}

export class GetTopUsersQueryParams extends PaginationParams {
  @ApiProperty({
    type: [String],
    required: false,
    default: ['avgScores desc', 'sumScore desc'],
  })
  @IsOptional()
  sort?: string[] = [
    `${TopUsersSortBy.AVG_SCORES} desc`,
    `${TopUsersSortBy.SUM_SCORES} desc`,
  ];
}
