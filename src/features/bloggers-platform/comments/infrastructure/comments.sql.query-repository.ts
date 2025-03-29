import { Injectable } from '@nestjs/common';
import { CommentViewModel } from '../api/models/view/comment.view.model';
import { LikeStatus } from '../../likes/domain/like.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsSqlQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getCommentById(
    currentUserId: string,
    id: string,
  ): Promise<CommentViewModel | null> {
    const foundComment = await this.dataSource.query(
      `SELECT c.*,
              u."login"                                  AS "userLogin",
              COUNT(CASE WHEN lc.status = $1 THEN 1 END) AS "likesCount",
              COUNT(CASE WHEN lc.status = $2 THEN 1 END) AS "dislikesCount"
       FROM "comments" c
                LEFT JOIN "likesForComments" lc ON c.id = lc."commentId"
                LEFT JOIN "users" u ON c."userId" = u.id
       WHERE c.id = $3
       GROUP BY c.id, u.login`,
      [LikeStatus.Like, LikeStatus.Dislike, id],
    );
    if (foundComment.length === 0) return null;
    const currentStatus = await this.getStatus(
      foundComment[0].id,
      currentUserId,
    );
    return CommentViewModel.mapToView(foundComment[0], currentStatus);
  }

  private async getStatus(
    commentId: string,
    userId: string,
  ): Promise<LikeStatus> {
    if (!userId) return LikeStatus.None;
    const like = await this.dataSource.query(
      `SELECT lc."status"
       FROM "likesForComments" lc
       WHERE "commentId" = $1
         AND "userId" = $2`,
      [commentId, userId],
    );
    return like.length !== 0 ? like[0] : LikeStatus.None;
  }
}
