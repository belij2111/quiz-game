import { Injectable } from '@nestjs/common';
import { LikeInputModel } from '../api/models/input/like.input.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { LikeForComment } from '../domain/like-for-comment.sql.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesForCommentSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(like: LikeForComment): Promise<string> {
    const result = await this.dataSource.query(
      `INSERT INTO "likesForComments"
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [like.id, like.createdAt, like.status, like.userId, like.commentId],
    );
    return result[0].id;
  }

  async update(
    foundLike: LikeForComment,
    likeInputModel: LikeInputModel,
  ): Promise<boolean | null> {
    const result = await this.dataSource.query(
      `UPDATE "likesForComments" lc
       SET "status" = $1
       WHERE id = $2
      `,
      [likeInputModel.likeStatus, foundLike.id],
    );
    return result.rowCount !== 0;
  }

  async find(
    userId: string,
    commentId: string,
  ): Promise<LikeForComment | null> {
    const result = await this.dataSource.query(
      `SELECT *
       FROM "likesForComments" lc
       WHERE lc."userId" = $1
         AND lc."commentId" = $2
      `,
      [userId, commentId],
    );
    return result[0];
  }
}
