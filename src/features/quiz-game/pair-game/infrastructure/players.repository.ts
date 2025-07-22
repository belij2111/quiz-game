import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Player } from '../domain/player.entity';

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

  async findByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<Player | null> {
    return await this.getRepo(manager).findOne({
      where: { userId: userId },
    });
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
}
