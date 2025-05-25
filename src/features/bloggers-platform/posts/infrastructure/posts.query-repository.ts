import { Injectable, NotFoundException } from '@nestjs/common';
import { PostViewModel } from '../api/models/view/post.view-model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../likes/api/models/enums/like-status.enum';
import { Post } from '../domain/post.entity';
import { GetPostQueryParams } from '../api/models/input/create-post.input-model';
import { SortDirection } from '../../../../core/models/base-query-params.input-model';
import { PaginatedViewModel } from '../../../../core/models/base-paginated.view-model';
import { LikeForPost } from '../../likes/domain/like-for-post.entity';
import { PostRawDataDto } from '../dto/post-raw-data.dto';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getById(currentUserId: string, id: number): Promise<PostViewModel> {
    const query = this.getBaseQuery();
    query.where('p.id = :id', { id: id });
    const foundPost = await query.getRawOne();
    if (!foundPost) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    const currentStatus = await this.getLikeStatus(id, currentUserId);
    return PostViewModel.mapToView(foundPost, currentStatus);
  }

  async getAllByBlogId(
    currentUserId: string,
    blogId: number,
    inputQuery: GetPostQueryParams,
  ): Promise<PaginatedViewModel<PostViewModel[]>> {
    const { sortBy, sortDirection } = inputQuery;
    const query = this.getBaseQuery().where('p.blogId = :blogId', {
      blogId: blogId,
    });
    const sortDirectionIsInUpperCase =
      sortDirection.toUpperCase() as SortDirection;
    if (sortBy && sortDirectionIsInUpperCase) {
      query.orderBy(`"${sortBy}"`, sortDirectionIsInUpperCase);
    }
    query.offset(inputQuery.calculateSkip()).limit(inputQuery.pageSize);
    const foundPosts = await query.getRawMany();
    if (foundPosts.length === 0) {
      throw new NotFoundException(`Post with id ${blogId} not found`);
    }
    const totalCount = await query.getCount();
    const items = await this.getItems(foundPosts, currentUserId);
    return PaginatedViewModel.mapToView({
      pageNumber: inputQuery.pageNumber,
      pageSize: inputQuery.pageSize,
      totalCount,
      items,
    });
  }

  async getAll(
    currentUserId: string,
    inputQuery: GetPostQueryParams,
  ): Promise<PaginatedViewModel<PostViewModel[]>> {
    const { sortBy, sortDirection } = inputQuery;
    const query = this.getBaseQuery();
    const sortDirectionIsInUpperCase =
      sortDirection.toUpperCase() as SortDirection;
    if (sortBy && sortDirectionIsInUpperCase) {
      query.orderBy(`"${sortBy}"`, sortDirectionIsInUpperCase);
    }
    query.offset(inputQuery.calculateSkip()).limit(inputQuery.pageSize);
    const foundPosts = await query.getRawMany();
    if (foundPosts.length === 0) {
      throw new NotFoundException(`Post not found`);
    }
    const totalCount = await query.getCount();
    const items = await this.getItems(foundPosts, currentUserId);
    return PaginatedViewModel.mapToView({
      pageNumber: inputQuery.pageNumber,
      pageSize: inputQuery.pageSize,
      totalCount,
      items,
    });
  }

  private async getItems(foundPosts: PostRawDataDto[], currentUserId: string) {
    const postIds = foundPosts.map((p) => p.id);
    const allStatuses = await this.getAllLikeStatuses(postIds, currentUserId);
    return foundPosts.map((post) => {
      const status =
        currentUserId && allStatuses.find((s) => s.postId === post.id);
      const currentStatus = status ? status.likeStatus : LikeStatus.None;
      return PostViewModel.mapToView(post, currentStatus);
    });
  }

  private getBaseQuery() {
    return this.dataSource
      .getRepository(Post)
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b')
      .leftJoinAndSelect('p.likeForPost', 'lp')
      .leftJoin('lp.user', 'u')
      .select([
        'p.id as "id"',
        'p.title as "title"',
        'p.shortDescription as "shortDescription"',
        'p.content as "content"',
        'b.id as "blogId"',
        'b.name as "blogName"',
        'p.createdAt as "createdAt"',
        'COUNT(CASE WHEN lp.likeStatus = :like THEN 1 END) as "likesCount"',
        'COUNT(CASE WHEN lp.likeStatus = :dislike THEN 1 END) as "dislikesCount"',
        `json_agg(
            json_build_object(
            'addedAt', lp."created_at",
            'userId', lp."user_id",
            'login', u."login"
            )
            ORDER BY lp."created_at" DESC
        ) FILTER (WHERE lp.likeStatus = :like ) as "newestLikes"`,
      ])
      .setParameters({
        like: LikeStatus.Like,
        dislike: LikeStatus.Dislike,
      })
      .groupBy('p.id,b.id');
  }

  private async getLikeStatus(
    postId: number,
    userId: string | boolean,
  ): Promise<LikeStatus> {
    if (!userId || userId === true) return LikeStatus.None;
    const status = await this.dataSource
      .getRepository(LikeForPost)
      .createQueryBuilder('lp')
      .select('lp.likeStatus as "likeStatus"')
      .where('lp.userId = :userId', { userId: userId })
      .andWhere('lp.postId = :postId', { postId: postId })
      .getRawOne();
    return status ? status.likeStatus : LikeStatus.None;
  }

  private async getAllLikeStatuses(
    postIds: number[],
    userId: string | boolean,
  ): Promise<{ postId: number; likeStatus: LikeStatus }[]> {
    if (!userId || userId === true) return [];
    return this.dataSource
      .getRepository(LikeForPost)
      .createQueryBuilder('lp')
      .select(['lp.postId as "postId"', 'lp.likeStatus as "likeStatus"'])
      .where('lp.userId = :userId', { userId: userId })
      .andWhere('lp.postId IN (:...postIds)', { postIds: postIds })
      .getRawMany();
  }
}
