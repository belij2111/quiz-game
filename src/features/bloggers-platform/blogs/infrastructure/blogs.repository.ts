import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(blog: Blog) {
    const result = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Blog)
      .values(blog)
      .returning('id')
      .execute();
    return result.raw[0].id;
  }
}
