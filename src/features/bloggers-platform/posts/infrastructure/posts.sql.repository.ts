import { Injectable } from '@nestjs/common';
import { Post } from '../domain/post.sql.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(newPost: Post): Promise<string> {
    const result = await this.dataSource.query(
      `INSERT INTO "posts"(id, "title", "shortDescription", "content", "blogId", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        newPost.id,
        newPost.title,
        newPost.shortDescription,
        newPost.content,
        newPost.blogId,
        newPost.createdAt,
      ],
    );
    return result[0].id;
  }
}
