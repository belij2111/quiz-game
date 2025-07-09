import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GamePairViewDto } from '../../api/view-dto/game-pair.view-dto';
import { GamesQueryRepository } from '../../infrastructure/games.query-repository';

export class GetPairGameOfCurrentUserQuery {
  constructor(public currentUserId: string) {}
}

@QueryHandler(GetPairGameOfCurrentUserQuery)
export class GetPairGameOfCurrentUserHandler
  implements IQueryHandler<GetPairGameOfCurrentUserQuery, GamePairViewDto>
{
  constructor(private readonly gamesQueryRepository: GamesQueryRepository) {}
  async execute(
    query: GetPairGameOfCurrentUserQuery,
  ): Promise<GamePairViewDto> {
    const foundGameId =
      await this.gamesQueryRepository.getByUserIdOrNotFoundFail(
        query.currentUserId,
      );
    return await this.gamesQueryRepository.getByIdOrNotFoundFail(foundGameId);
  }
}
