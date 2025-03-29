import { Injectable } from '@nestjs/common';
import { Comment } from '../domain/comment.sql.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(comment: Comment): Promise<string> {
    const result = await this.dataSource.query(
      `INSERT INTO "comments"(id, "content", "createdAt", "postId", "userId")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        comment.id,
        comment.content,
        comment.createdAt,
        comment.postId,
        comment.userId,
      ],
    );
    return result[0].id;
  }
}
