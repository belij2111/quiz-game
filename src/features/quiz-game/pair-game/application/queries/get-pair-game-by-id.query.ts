import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GamePairViewDto } from '../../api/view-dto/game-pair.view-dto';
import { GamesQueryRepository } from '../../infrastructure/games.query-repository';

export class GetPairGameByIdQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetPairGameByIdQuery)
export class GetPairGameByIdQueryHandler
  implements IQueryHandler<GetPairGameByIdQuery, GamePairViewDto>
{
  constructor(private readonly gamesQueryRepository: GamesQueryRepository) {}
  async execute(query: GetPairGameByIdQuery): Promise<GamePairViewDto> {
    return await this.gamesQueryRepository.getByIdOrNotFoundFail(query.id);
  }
}
