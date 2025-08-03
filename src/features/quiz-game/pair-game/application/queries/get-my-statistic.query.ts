import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MyStatisticViewDto } from '../../api/view-dto/my-statistic.view-dto';
import { PlayersRepository } from '../../infrastructure/players.repository';
import { CalculateStatisticsService } from '../services/calculate-statistics.service';

export class GetMyStatisticQuery {
  constructor(public currentUserId: string) {}
}

@QueryHandler(GetMyStatisticQuery)
export class GetMyStatisticQueryHandler
  implements IQueryHandler<GetMyStatisticQuery, MyStatisticViewDto>
{
  constructor(
    private readonly playersRepository: PlayersRepository,
    private readonly calculateStatisticsService: CalculateStatisticsService,
  ) {}
  async execute(query: GetMyStatisticQuery): Promise<MyStatisticViewDto> {
    const foundPlayers =
      await this.playersRepository.findByUserIdOrNotFoundFail(
        query.currentUserId,
      );
    const createdStatisticDto: MyStatisticViewDto =
      this.calculateStatisticsService.calculateStatistics(foundPlayers);
    return MyStatisticViewDto.mapToView(createdStatisticDto);
  }
}
