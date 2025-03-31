import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewModel } from '../api/models/view/comment.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetCommentQueryParams } from '../api/models/input/create-comment.input.model';
import { PaginatedViewModel } from '../../../../core/models/base.paginated.view.model';
import { Post } from '../../posts/domain/post.sql.entity';
import { CommentDto } from '../domain/comment.sql.entity';
import { LikeStatus } from '../../likes/api/models/enums/like-status-enum';

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

  async getCommentsByPostId(
    currentUserId: string,
    postId: string,
    query: GetCommentQueryParams,
  ): Promise<PaginatedViewModel<CommentViewModel[]>> {
    const foundPost = await this.findPostByIdOrNotFoundFail(postId);
    const foundComments = await this.dataSource.query(
      `SELECT c.*,
              u.login                                    AS "userLogin",
              COUNT(CASE WHEN lc.status = $1 THEN 1 END) AS "likesCount",
              COUNT(CASE WHEN lc.status = $2 THEN 1 END) AS "dislikesCount"
       FROM "comments" c
                LEFT JOIN "likesForComments" lc ON c.id = lc."commentId"
                LEFT JOIN "users" u ON c."userId" = u.id
       WHERE c."postId" = $3
       GROUP BY c.id, u.login
       ORDER BY "${query.sortBy}" ${query.sortDirection}
       LIMIT $4 OFFSET $5
      `,
      [
        LikeStatus.Like,
        LikeStatus.Dislike,
        foundPost.id,
        query.pageSize,
        query.calculateSkip(),
      ],
    );
    const countQuery = await this.dataSource.query(
      `SELECT COUNT(*)
       FROM "comments" c
       WHERE c."postId" = $1`,
      [foundPost.id],
    );
    const totalCount = parseInt(countQuery[0].count, 10);
    const currentStatuses = await Promise.all(
      foundComments.map((comment: { id: string }) =>
        this.getStatus(comment.id, currentUserId),
      ),
    );
    const items = foundComments.map(
      (comment: CommentDto, index: string | number) =>
        CommentViewModel.mapToView(comment, currentStatuses[index]),
    );
    return PaginatedViewModel.mapToView({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    });
  }

  private async findPostByIdOrNotFoundFail(postId: string): Promise<Post> {
    const foundPost = await this.findPostById(postId);
    if (!foundPost) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }
    return foundPost;
  }

  private async findPostById(postId: string): Promise<Post | null> {
    const result = await this.dataSource.query(
      `SELECT p.*
       FROM "posts" p
       WHERE p.id = $1`,
      [postId],
    );
    return result[0];
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
    return like.length !== 0 ? like[0].status : LikeStatus.None;
  }
}
