import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Player } from '../domain/player.entity';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class PlayersQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findByUserIdOrNotFoundFail(userId: string): Promise<Player[]> {
    const foundPlayer = await this.findByUserId(userId);
    if (foundPlayer.length === 0) {
      throw new NotFoundException(
        `No players found for the user with the ID ${userId}`,
      );
    }
    return foundPlayer;
  }

  async findByUserId(userId: string): Promise<Player[] | []> {
    return await this.dataSource
      .createQueryBuilder(Player, 'p')
      .where('p."user_id" = :userId', { userId: userId })
      .getMany();
  }

  async findByUserIdsOrNotFoundFail(userIds: string[]): Promise<Player[]> {
    const foundPlayers = await this.findByUserIds(userIds);
    if (foundPlayers.length === 0) {
      throw new NotFoundException('Users are not players');
    }
    return foundPlayers;
  }

  async findByUserIds(userIds: string[]): Promise<Player[] | []> {
    return await this.dataSource
      .createQueryBuilder(Player, 'p')
      .where('p."user_id" IN (:...userIds)', { userIds: userIds })
      .getMany();
  }
}
