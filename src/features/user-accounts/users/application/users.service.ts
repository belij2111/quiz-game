import { Injectable } from '@nestjs/common';
import { UsersSqlRepository } from '../infrastructure/users.sql.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersSqlRepository: UsersSqlRepository) {}

  async delete(id: string): Promise<boolean> {
    return this.usersSqlRepository.delete(id);
  }
}
