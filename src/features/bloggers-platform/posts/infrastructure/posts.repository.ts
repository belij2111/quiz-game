import { Injectable } from '@nestjs/common';
import { Post } from '../domain/post.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(post: Post) {
    const result = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values(post)
      .returning('id')
      .execute();
    return result.raw[0].id;
  }
}
