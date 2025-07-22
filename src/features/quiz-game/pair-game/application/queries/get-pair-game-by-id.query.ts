import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GamePairViewDto } from '../../api/view-dto/game-pair.view-dto';
import { GamesQueryRepository } from '../../infrastructure/games.query-repository';
import { ForbiddenException } from '@nestjs/common';
import { GamesRepository } from '../../infrastructure/games.repository';

export class GetPairGameByIdQuery {
  constructor(
    public currentUserId: string,
    public id: string,
  ) {}
}

@QueryHandler(GetPairGameByIdQuery)
export class GetPairGameByIdQueryHandler
  implements IQueryHandler<GetPairGameByIdQuery, GamePairViewDto>
{
  constructor(
    private readonly gamesQueryRepository: GamesQueryRepository,
    private readonly gamesRepository: GamesRepository,
  ) {}
  async execute(query: GetPairGameByIdQuery): Promise<GamePairViewDto> {
    const foundGameIdOfCurrentUser = await this.gamesRepository.findByUserId(
      query.currentUserId,
    );
    const foundGameById = await this.gamesQueryRepository.getByIdOrNotFoundFail(
      query.id,
    );
    if (
      !foundGameIdOfCurrentUser ||
      foundGameIdOfCurrentUser.id !== foundGameById.id
    ) {
      throw new ForbiddenException('User is not in an active pair');
    }
    return foundGameById;
  }
}
