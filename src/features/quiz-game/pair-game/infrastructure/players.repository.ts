import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Player } from '../domain/player.entity';
import { Game } from '../domain/game.entity';

@Injectable()
export class PlayersRepository {
  private getRepo(manager?: EntityManager): Repository<Player> {
    return (
      manager?.getRepository(Player) || this.dataSource.getRepository(Player)
    );
  }
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findByUserIdAndByGameId(
    userId: string,
    gameId: string,
    manager?: EntityManager,
  ): Promise<Player | null> {
    return this.getRepo(manager)
      .createQueryBuilder('p')
      .innerJoin(
        Game,
        'g',
        '(g.first_player_id = p.id OR g.second_player_id = p.id) AND g.id = :gameId',
        { gameId: gameId },
      )
      .where('p.user_id = :userId', { userId: userId })
      .getOne();
  }

  async create(player: Player, manager?: EntityManager) {
    return await this.getRepo(manager).save(player);
  }

  async findByIdOrNotFoundFail(
    id: string,
    manager?: EntityManager,
  ): Promise<Player> {
    const foundPlayer = await this.findById(id, manager);
    if (!foundPlayer) {
      throw new NotFoundException(`Game with id ${id}`);
    }
    return foundPlayer;
  }

  async findById(id: string, manager?: EntityManager): Promise<Player | null> {
    return await this.getRepo(manager).findOneBy({ id: id });
  }

  async update(player: Player, manager?: EntityManager) {
    return await this.getRepo(manager).save(player);
  }

  async findByUserIdOrNotFoundFail(
    userId: string,
    manager?: EntityManager,
  ): Promise<Player[]> {
    const foundPlayer = await this.findByUserId(userId, manager);
    if (!foundPlayer) {
      throw new NotFoundException(
        `No players found for the user with the ID ${userId}`,
      );
    }
    return foundPlayer;
  }

  async findByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<Player[] | null> {
    return await this.getRepo(manager).find({ where: { userId: userId } });
  }
}
