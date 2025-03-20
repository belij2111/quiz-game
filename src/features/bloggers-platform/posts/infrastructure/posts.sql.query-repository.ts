import { Injectable } from '@nestjs/common';
import { PostViewModel } from '../api/models/view/post.view.model';
import { LikeStatus } from '../../likes/domain/like.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsSqlQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getById(
    currentUserId: string,
    id: string,
  ): Promise<PostViewModel | null> {
    const foundPost = await this.dataSource.query(
      `SELECT p.*,
              b."name"                                  AS "blogName",
              COUNT(CASE WHEN l.status = $1 THEN 1 END) AS "likesCount",
              COUNT(CASE WHEN l.status = $2 THEN 1 END) AS "dislikesCount",
              l."userId"                                AS "userId",
              l."createdAt"                             AS "addedAt",
              u.login
       FROM "posts" p
                LEFT JOIN "likesForPosts" l ON p.id = l."postId"
                LEFT JOIN "users" u ON l."userId" = u.id
                LEFT JOIN "blogs" b ON p."blogId" = b.id
       WHERE p.id = $3
       GROUP BY p.id, l."userId", l."createdAt", b."name", u.login
       ORDER BY l."createdAt" DESC
      `,
      [LikeStatus.Like, LikeStatus.Dislike, id],
    );
    if (foundPost.length === 0) return null;
    const currentStatus = await this.getStatus(foundPost[0].id, currentUserId);
    return PostViewModel.mapToView(foundPost[0], currentStatus);
  }

  private async getStatus(
    postId: string,
    userId: string | boolean,
  ): Promise<LikeStatus> {
    if (!userId || userId === true) return LikeStatus.None;
    const like = await this.dataSource.query(
      `SELECT *
       FROM "likesForPosts"
       WHERE "postId" = $1
         AND "userId" = $2`,
      [postId, userId],
    );
    return like.length !== 0 ? like[0].status : LikeStatus.None;
  }
}
