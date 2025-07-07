import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../domain/game.entity';
import { GameStatus } from '../api/enums/game-status.enum';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(Game) private readonly gamesRepository: Repository<Game>,
  ) {}

  async create(game: Game): Promise<string> {
    const result = await this.gamesRepository.save(game);
    return result.id;
  }

  async findActiveGameByPlayerId(playerId: string): Promise<Game | null> {
    return await this.gamesRepository.findOne({
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

  async findByStatus(status: GameStatus) {
    return await this.gamesRepository.findOne({ where: { status: status } });
  }

  async findByIdOrNotFoundFail(id: string): Promise<Game> {
    const foundGame = await this.findById(id);
    if (!foundGame) {
      throw new NotFoundException(`Game with id ${id}`);
    }
    return foundGame;
  }

  async findById(id: string): Promise<Game | null> {
    return await this.gamesRepository.findOneBy({ id: id });
  }

  async update(game: Game): Promise<string> {
    const result = await this.gamesRepository.save(game);
    return result.id;
  }
}
