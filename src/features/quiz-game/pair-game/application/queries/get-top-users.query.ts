import {
  GetTopUsersQueryParams,
  TopUsersSortBy,
} from '../../api/input-dto/get-top-users-query-params';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewModel } from '../../../../../core/models/base-paginated.view-model';
import { TopGamePlayerViewDto } from '../../api/view-dto/top-game-player.view-dto';
import { UsersQueryRepository } from '../../../../user-accounts/users/infrastructure/users.query-repository';
import { PlayersQueryRepository } from '../../infrastructure/players.query-repository';
import { CalculateStatisticsService } from '../services/calculate-statistics.service';
import { MyStatisticViewDto } from '../../api/view-dto/my-statistic.view-dto';

export class GetTopUsersQuery {
  constructor(public inputQuery: GetTopUsersQueryParams) {}
}

@QueryHandler(GetTopUsersQuery)
export class GetTopUsersQueryHandler
  implements
    IQueryHandler<GetTopUsersQuery, PaginatedViewModel<TopGamePlayerViewDto[]>>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly playersQueryRepository: PlayersQueryRepository,
    private readonly calculateStatisticsService: CalculateStatisticsService,
  ) {}

  async execute(
    query: GetTopUsersQuery,
  ): Promise<PaginatedViewModel<TopGamePlayerViewDto[]>> {
    const inputQuery = query.inputQuery;
    const foundUsers =
      await this.usersQueryRepository.getUsersWhoArePlayersOrNotFoundFail();
    const userIds = foundUsers.map((u) => u.id);
    const foundPlayers =
      await this.playersQueryRepository.findByUserIdsOrNotFoundFail(userIds);
    const playersByUserId = foundPlayers.reduce((acc, player) => {
      if (!acc[player.userId]) acc[player.userId] = [];
      acc[player.userId].push(player);
      return acc;
    }, {});
    const usersWithStats = foundUsers.map((user) => {
      const userPlayers = playersByUserId[user.id];
      const stats =
        this.calculateStatisticsService.calculateStatistics(userPlayers);
      return { user, stats };
    });
    const sortedUsers = this.sortUsersWithStats(
      usersWithStats,
      inputQuery.sort,
    );
    const paginatedUsers = sortedUsers.slice(
      inputQuery.calculateSkip(),
      inputQuery.calculateSkip() + inputQuery.pageSize,
    );
    const items = paginatedUsers.map(({ stats, user }) => {
      return TopGamePlayerViewDto.mapToView(stats, {
        id: user.id,
        login: user.login,
      });
    });

    return PaginatedViewModel.mapToView({
      pageSize: inputQuery.pageSize,
      pageNumber: inputQuery.pageNumber,
      totalCount: sortedUsers.length,
      items,
    });
  }

  private sortUsersWithStats(usersWithStats, sortParams) {
    return usersWithStats.sort((a, b) => {
      for (const sortParam of sortParams) {
        const [field, direction] = sortParam.split(' ');
        const compareResult = this.compareByField(
          a.stats,
          b.stats,
          field as TopUsersSortBy,
        );
        if (compareResult !== 0) {
          return direction === 'desc' ? -compareResult : compareResult;
        }
      }
      return 0;
    });
  }

  private compareByField(
    a: MyStatisticViewDto,
    b: MyStatisticViewDto,
    field: TopUsersSortBy,
  ): number {
    switch (field) {
      case TopUsersSortBy.AVG_SCORES:
        return a.avgScores - b.avgScores;
      case TopUsersSortBy.SUM_SCORES:
        return a.sumScore - b.sumScore;
      case TopUsersSortBy.WINS_COUNT:
        return a.winsCount - b.winsCount;
      case TopUsersSortBy.LOSSES_COUNT:
        return a.lossesCount - b.lossesCount;
      case TopUsersSortBy.DRAWS_COUNT:
        return a.drawsCount - b.drawsCount;
      case TopUsersSortBy.GAMES_COUNT:
        return a.gamesCount - b.gamesCount;
      default:
        return 0;
    }
  }
}
