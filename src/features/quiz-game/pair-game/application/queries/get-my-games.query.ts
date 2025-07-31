import { GetPairGameQueryParams } from '../../api/input-dto/get-pair-game-query-params';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewModel } from '../../../../../core/models/base-paginated.view-model';
import { GamePairViewDto } from '../../api/view-dto/game-pair.view-dto';
import { GamesQueryRepository } from '../../infrastructure/games.query-repository';

export class GetMyGamesQuery {
  constructor(
    public currentUserId: string,
    public inputQuery: GetPairGameQueryParams,
  ) {}
}

@QueryHandler(GetMyGamesQuery)
export class GetMyGamesQueryHandler
  implements
    IQueryHandler<GetMyGamesQuery, PaginatedViewModel<GamePairViewDto[]>>
{
  constructor(private readonly gamesQueryRepository: GamesQueryRepository) {}
  async execute(
    query: GetMyGamesQuery,
  ): Promise<PaginatedViewModel<GamePairViewDto[]>> {
    const { currentUserId, inputQuery } = query;
    return await this.gamesQueryRepository.getMyGames(
      currentUserId,
      inputQuery,
    );
  }
}
