import { Injectable } from '@nestjs/common';
import { UserViewModel } from '../api/models/view/user.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getById(id: number): Promise<UserViewModel | null> {
    const foundUser = await this.dataSource.query(
      `SELECT * FROM "users"
         WHERE id=$1`,
      [id],
    );
    if (foundUser.length === 0) return null;
    return UserViewModel.mapToView(foundUser[0]);
  }
}
