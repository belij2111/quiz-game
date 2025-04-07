import { Injectable } from '@nestjs/common';
import { LikeInputModel } from '../api/models/input/like.input.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeForPost } from '../domain/like-for-post.sql.entity';

@Injectable()
export class LikesForPostSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(like: LikeForPost): Promise<string> {
    const result = await this.dataSource.query(
      `INSERT INTO "likesForPosts"
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [like.id, like.createdAt, like.status, like.userId, like.postId],
    );
    return result[0].id;
  }

  async update(
    foundLike: LikeForPost,
    likeInputModel: LikeInputModel,
  ): Promise<boolean | null> {
    const result = await this.dataSource.query(
      `UPDATE "likesForPosts" lp
       SET "status" = $1, "createdAt" = DEFAULT
       WHERE id = $2
      `,
      [likeInputModel.likeStatus, foundLike.id],
    );
    return result.rowCount !== 0;
  }

  async find(userId: string, postId: string): Promise<LikeForPost | null> {
    const result = await this.dataSource.query(
      `SELECT *
       FROM "likesForPosts" lp
       WHERE lp."userId" = $1
         AND lp."postId" = $2
      `,
      [userId, postId],
    );
    return result[0];
  }
}
