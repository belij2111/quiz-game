import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(newUser: User): Promise<number> {
    const result = await this.dataSource.query(
      `INSERT INTO "users" ("login","password","email","createdAt","confirmationCode","expirationDate","isConfirmed")
values ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [
        newUser.login,
        newUser.password,
        newUser.email,
        newUser.createdAt,
        newUser.emailConfirmation.confirmationCode,
        newUser.emailConfirmation.expirationDate,
        newUser.emailConfirmation.isConfirmed,
      ],
    );
    return result[0].id;
  }

  async delete(id: string): Promise<boolean> {
    const deletionResult = await this.dataSource.query(
      `DELETE FROM "users" WHERE id = $1`,
      [id],
    );
    return deletionResult[1] === 1;
  }
}
