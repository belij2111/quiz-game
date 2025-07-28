import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GamePairViewDto } from '../../api/view-dto/game-pair.view-dto';
import { GamesQueryRepository } from '../../infrastructure/games.query-repository';
import { GamesRepository } from '../../infrastructure/games.repository';
import { NotFoundException } from '@nestjs/common';

export class GetPairGameOfCurrentUserQuery {
  constructor(public currentUserId: string) {}
}

@QueryHandler(GetPairGameOfCurrentUserQuery)
export class GetPairGameOfCurrentUserHandler
  implements IQueryHandler<GetPairGameOfCurrentUserQuery, GamePairViewDto>
{
  constructor(
    private readonly gamesQueryRepository: GamesQueryRepository,
    private readonly gamesRepository: GamesRepository,
  ) {}
  async execute(
    query: GetPairGameOfCurrentUserQuery,
  ): Promise<GamePairViewDto> {
    const foundGame =
      await this.gamesRepository.findPendingOrActiveGameByUserId(
        query.currentUserId,
      );
    if (!foundGame) {
      throw new NotFoundException(
        `Current user doesn't have active or pending game`,
      );
    }
    return await this.gamesQueryRepository.getByIdOrNotFoundFail(foundGame.id);
  }
}
