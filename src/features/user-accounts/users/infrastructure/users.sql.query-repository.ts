import { Injectable } from '@nestjs/common';
import { UserViewModel } from '../api/models/view/user.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetUsersQueryParams } from '../api/models/input/create-user.input.model';
import { PaginatedViewModel } from '../../../../core/models/base.paginated.view.model';
import { MeViewModel } from '../../auth/api/models/view/me.view.model';

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

  async getAll(
    inputQuery: GetUsersQueryParams,
  ): Promise<PaginatedViewModel<UserViewModel[]>> {
    const searchLoginTerm = inputQuery.searchLoginTerm || '';
    const searchEmailTerm = inputQuery.searchEmailTerm || '';
    const query = `
    SELECT * FROM "users"
        WHERE login ILIKE $1 OR email ILIKE $2
        ORDER BY "${inputQuery.sortBy}" ${inputQuery.sortDirection}
        LIMIT $3 OFFSET $4
    `;
    const values = [
      `%${searchLoginTerm}%`,
      `%${searchEmailTerm}%`,
      inputQuery.pageSize,
      inputQuery.calculateSkip(),
    ];
    const foundUsers = await this.dataSource.query(query, values);
    const countQuery = `
    SELECT COUNT(*) FROM "users"
    WHERE login ILIKE $1 OR email ILIKE $2
    `;
    const totalCountResult = await this.dataSource.query(countQuery, [
      `%${searchLoginTerm}%`,
      `%${searchEmailTerm}%`,
    ]);

    const totalCount = parseInt(totalCountResult[0].count, 10);
    const items = foundUsers.map(UserViewModel.mapToView);
    return PaginatedViewModel.mapToView({
      pageNumber: inputQuery.pageNumber,
      pageSize: inputQuery.pageSize,
      totalCount,
      items,
    });
  }

  async getAuthUserById(id: number): Promise<MeViewModel | null> {
    const foundUser = await this.dataSource.query(
      `SELECT * FROM "users"
         WHERE id=$1`,
      [id],
    );
    if (foundUser.length === 0) return null;
    return MeViewModel.mapToView(foundUser[0]);
  }
}
