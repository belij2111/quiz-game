import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/user.entity';
import { Repository } from 'typeorm';
import { UserViewModel } from '../api/models/view/user.view.model';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersQueryRepository: Repository<User>,
  ) {}

  async getById(id: string): Promise<UserViewModel | null> {
    const foundUser = await this.usersQueryRepository.findOneBy({ id: id });
    if (!foundUser) return null;
    return UserViewModel.mapToView(foundUser);
  }
}
