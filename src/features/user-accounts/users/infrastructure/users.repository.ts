import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<string> {
    const result = await this.usersRepository.save(user);
    return result.id;
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
      relations: { emailConfirmation: true, securityDevice: true },
    });
    if (!user) {
      throw new NotFoundException('User not found or already deleted');
    }
    await this.usersRepository.softRemove(user);
    return true;
  }
  async findByLoginOrEmail(loginOrEmail: string) {
    return await this.usersRepository.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async updateRecoveryCode(user: User): Promise<void> {
    await this.usersRepository.save(user);
  }
}
