import { Injectable } from '@nestjs/common';
import { Comment } from '../domain/comment.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(comment: Comment): Promise<string> {
    const result = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Comment)
      .values(comment)
      .returning('id')
      .execute();
    return result.raw[0].id;
  }
}
