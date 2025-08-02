import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MyStatisticViewDto } from '../../api/view-dto/my-statistic.view-dto';
import { PlayersRepository } from '../../infrastructure/players.repository';
import { Player } from '../../domain/player.entity';
import { PlayerStatusEnum } from '../../api/enums/player-status.enum';

export class GetMyStatisticQuery {
  constructor(public currentUserId: string) {}
}

@QueryHandler(GetMyStatisticQuery)
export class GetMyStatisticQueryHandler
  implements IQueryHandler<GetMyStatisticQuery, MyStatisticViewDto>
{
  constructor(private readonly playersRepository: PlayersRepository) {}
  async execute(query: GetMyStatisticQuery): Promise<MyStatisticViewDto> {
    const foundPlayers =
      await this.playersRepository.findByUserIdOrNotFoundFail(
        query.currentUserId,
      );
    const createdStatisticDto: MyStatisticViewDto =
      this.calculateStatistics(foundPlayers);
    return MyStatisticViewDto.mapToView(createdStatisticDto);
  }

  private calculateStatistics(players: Player[]): MyStatisticViewDto {
    const sumScore = players.reduce((sum, player) => sum + player.score, 0);
    const gamesCount = players.length;
    const avgScores = this.calculateAverageScore(sumScore, gamesCount);
    const winsCount = players.filter(
      (p) => p.status === PlayerStatusEnum.WIN,
    ).length;
    const lossesCount = players.filter(
      (p) => p.status === PlayerStatusEnum.LOSE,
    ).length;
    const drawsCount = players.filter(
      (p) => p.status === PlayerStatusEnum.DRAW,
    ).length;
    return {
      sumScore: sumScore,
      gamesCount: gamesCount,
      avgScores: avgScores,
      winsCount: winsCount,
      lossesCount: lossesCount,
      drawsCount: drawsCount,
    };
  }

  private calculateAverageScore(sumScore: number, gamesCount: number) {
    if (gamesCount === 0) return 0;
    const avg = sumScore / gamesCount;
    const rounded = Math.round(avg * 100) / 100;
    return rounded % 1 === 0 ? Math.trunc(rounded) : rounded;
  }
}
