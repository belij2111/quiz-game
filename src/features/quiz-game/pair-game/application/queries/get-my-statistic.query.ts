import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MyStatisticViewDto } from '../../api/view-dto/my-statistic.view-dto';
import { CalculateStatisticsService } from '../services/calculate-statistics.service';
import { PlayersQueryRepository } from '../../infrastructure/players.query-repository';

export class GetMyStatisticQuery {
  constructor(public currentUserId: string) {}
}

@QueryHandler(GetMyStatisticQuery)
export class GetMyStatisticQueryHandler
  implements IQueryHandler<GetMyStatisticQuery, MyStatisticViewDto>
{
  constructor(
    private readonly playersQueryRepository: PlayersQueryRepository,
    private readonly calculateStatisticsService: CalculateStatisticsService,
  ) {}
  async execute(query: GetMyStatisticQuery): Promise<MyStatisticViewDto> {
    const foundPlayers =
      await this.playersQueryRepository.findByUserIdOrNotFoundFail(
        query.currentUserId,
      );
    const createdStatisticDto: MyStatisticViewDto =
      this.calculateStatisticsService.calculateStatistics(foundPlayers);
    return MyStatisticViewDto.mapToView(createdStatisticDto);
  }
}
