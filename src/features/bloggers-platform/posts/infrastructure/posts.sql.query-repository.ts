import { Injectable, NotFoundException } from '@nestjs/common';
import { PostViewModel } from '../api/models/view/post.view.model';
import { LikeStatus } from '../../likes/domain/like.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blog } from '../../blogs/domain/blog.sql.entity';
import { GetPostQueryParams } from '../api/models/input/create-post.input.model';
import { PaginatedViewModel } from '../../../../core/models/base.paginated.view.model';
import { PostDto } from '../domain/post.sql.entity';

@Injectable()
export class PostsSqlQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getAll(
    currentUserId: string,
    query: GetPostQueryParams,
  ): Promise<PaginatedViewModel<PostViewModel[]>> {
    const foundPosts = await this.dataSource.query(
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
       GROUP BY p.id, l."userId", l."createdAt", b."name", u.login
       ORDER BY "${query.sortBy}" ${query.sortDirection}
       LIMIT $3 OFFSET $4
      `,
      [
        LikeStatus.Like,
        LikeStatus.Dislike,
        query.pageSize,
        query.calculateSkip(),
      ],
    );
    const countQuery = await this.dataSource.query(
      `SELECT COUNT(*)
       FROM "posts" p`,
    );
    const totalCount = parseInt(countQuery[0].count, 10);
    const currentStatuses = await Promise.all(
      foundPosts.map((post: { id: string }) =>
        this.getStatus(post.id, currentUserId),
      ),
    );
    const items = foundPosts.map((post: PostDto, index: string | number) =>
      PostViewModel.mapToView(post, currentStatuses[index]),
    );
    return PaginatedViewModel.mapToView({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    });
  }

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

  async getPostsByBlogId(
    currentUserId: string,
    blogId: string,
    query: GetPostQueryParams,
  ): Promise<PaginatedViewModel<PostViewModel[]>> {
    const foundBlog = await this.findByIdOrNotFoundFail(blogId);
    return this.getPosts(currentUserId, query, foundBlog.id);
  }

  async findByIdOrNotFoundFail(id: string): Promise<Blog> {
    const foundBlog = await this.findById(id);
    if (!foundBlog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
    return foundBlog;
  }

  async findById(id: string): Promise<Blog | null> {
    const result = await this.dataSource.query(
      `SELECT b.*
       FROM "blogs" b
       WHERE "id" = $1`,
      [id],
    );
    return result[0];
  }

  private async getPosts(
    currentUserId: string,
    query: GetPostQueryParams,
    blogId: string,
  ): Promise<PaginatedViewModel<PostViewModel[]>> {
    const foundPosts = await this.dataSource.query(
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
       WHERE p."blogId" = $3
       GROUP BY p.id, l."userId", l."createdAt", b."name", u.login
       ORDER BY "${query.sortBy}" ${query.sortDirection}
       LIMIT $4 OFFSET $5
      `,
      [
        LikeStatus.Like,
        LikeStatus.Dislike,
        blogId,
        query.pageSize,
        query.calculateSkip(),
      ],
    );
    const countQuery = await this.dataSource.query(
      `SELECT COUNT(*)
       FROM "posts" p
       WHERE p."blogId" = $1`,
      [blogId],
    );
    const totalCount = parseInt(countQuery[0].count, 10);
    const currentStatuses = await Promise.all(
      foundPosts.map((post: { id: string }) =>
        this.getStatus(post.id, currentUserId),
      ),
    );
    const items = foundPosts.map((post: PostDto, index: string | number) =>
      PostViewModel.mapToView(post, currentStatuses[index]),
    );
    return PaginatedViewModel.mapToView({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    });
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
