import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../domain/player.entity';

@Injectable()
export class PlayersRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) {}

  async findByUserId(userId: string): Promise<Player | null> {
    return await this.playersRepository.findOne({
      where: { userId: userId },
    });
  }

  async create(player: Player) {
    return await this.playersRepository.save(player);
  }

  async findByIdOrNotFoundFail(id: string): Promise<Player> {
    const foundPlayer = await this.findById(id);
    if (!foundPlayer) {
      throw new NotFoundException(`Game with id ${id}`);
    }
    return foundPlayer;
  }

  async findById(id: string): Promise<Player | null> {
    return await this.playersRepository.findOneBy({ id: id });
  }

  async update(player: Player) {
    return await this.playersRepository.save(player);
  }
}
