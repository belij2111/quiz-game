import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Game } from '../domain/game.entity';
import { GameStatus } from '../api/enums/game-status.enum';
import { InjectDataSource } from '@nestjs/typeorm';
import { Player } from '../domain/player.entity';

@Injectable()
export class GamesRepository {
  private getRepo(manager?: EntityManager): Repository<Game> {
    return manager?.getRepository(Game) || this.dataSource.getRepository(Game);
  }
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async save(game: Game, manager?: EntityManager): Promise<string> {
    const result = await this.getRepo(manager).save(game);
    return result.id;
  }

  async findActiveGameByPlayerId(
    playerId: string,
    manager?: EntityManager,
  ): Promise<Game | null> {
    return await this.getRepo(manager).findOne({
      where: [
        {
          firstPlayerId: playerId,
          status: GameStatus.ACTIVE,
        },
        {
          secondPlayerId: playerId,
          status: GameStatus.ACTIVE,
        },
      ],
    });
  }

  async findByStatus(status: GameStatus, manager?: EntityManager) {
    return await this.getRepo(manager).findOne({ where: { status: status } });
  }

  async findByIdOrNotFoundFail(
    id: string,
    manager?: EntityManager,
  ): Promise<Game> {
    const foundGame = await this.findById(id, manager);
    if (!foundGame) {
      throw new NotFoundException(`Game with id ${id}`);
    }
    return foundGame;
  }

  async findById(id: string, manager?: EntityManager): Promise<Game | null> {
    return await this.getRepo(manager).findOneBy({ id: id });
  }

  async findByUserIdOrNotFoundFail(currentUserId: string) {
    const foundGame = await this.findByUserId(currentUserId);
    if (!foundGame) {
      throw new NotFoundException(
        `Game for user with id ${currentUserId} not found`,
      );
    }
    return foundGame.id;
  }

  async findByUserId(currentUserId: string | null) {
    return await this.dataSource.manager
      .createQueryBuilder(Game, 'g')
      .select('g.id as "id"')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('p.id as "id"')
          .from(Player, 'p')
          .where('p.user_id = :userId', { userId: currentUserId })
          .getQuery();
        return `g.first_player_id IN ${subQuery} OR g.second_player_id IN ${subQuery}`;
      })
      .orderBy('g.created_at', 'DESC')
      .limit(1)
      .getRawOne();
  }

  async update(game: Game, manager?: EntityManager) {
    await this.getRepo(manager)
      .createQueryBuilder()
      .update(Game)
      .set(game)
      .where('id = :id', { id: game.id })
      .execute();
  }
}
