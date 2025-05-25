import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewModel } from '../api/models/view/comment.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../likes/api/models/enums/like-status.enum';
import { Comment } from '../domain/comment.entity';
import { GetCommentQueryParams } from '../api/models/input/create-comment.input-model';
import { SortDirection } from '../../../../core/models/base-query-params.input-model';
import { PaginatedViewModel } from '../../../../core/models/base-paginated.view-model';
import { LikeForComment } from '../../likes/domain/like-for-comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getById(currentUserId: string, id: number): Promise<CommentViewModel> {
    const query = this.getBaseQuery();
    query.where('c.id = :id', { id: id });
    const foundComment = await query.getRawOne();
    if (!foundComment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    const currentStatus = await this.getLikeStatus(id, currentUserId);
    return CommentViewModel.mapToView(foundComment, currentStatus);
  }

  async getAllByPostId(
    currentUserId: string,
    postId: number,
    inputQuery: GetCommentQueryParams,
  ) {
    const { sortBy, sortDirection } = inputQuery;
    const query = this.getBaseQuery().where('c.postId = :postId', {
      postId: postId,
    });
    const sortDirectionIsInUpperCase =
      sortDirection.toUpperCase() as SortDirection;
    if (sortBy && sortDirectionIsInUpperCase) {
      query.orderBy(`"${sortBy}"`, sortDirectionIsInUpperCase);
    }
    query.offset(inputQuery.calculateSkip()).limit(inputQuery.pageSize);
    const foundComments = await query.getRawMany();
    if (!foundComments) {
      throw new NotFoundException(
        `Comments on the Post with id ${postId} not found`,
      );
    }
    const totalCount = await query.getCount();
    const commentIds = foundComments.map((c) => c.id);
    const allStatuses = await this.getAllLikeStatuses(
      commentIds,
      currentUserId,
    );
    const items = foundComments.map((comment) => {
      const status =
        currentUserId && allStatuses.find((s) => s.commentId === comment.id);
      const currentStatus = status ? status.likeStatus : LikeStatus.None;
      return CommentViewModel.mapToView(comment, currentStatus);
    });
    return PaginatedViewModel.mapToView({
      pageNumber: inputQuery.pageNumber,
      pageSize: inputQuery.pageSize,
      totalCount,
      items,
    });
  }

  private getBaseQuery() {
    return this.dataSource.manager
      .createQueryBuilder(Comment, 'c')
      .leftJoinAndSelect('c.user', 'u')
      .leftJoinAndSelect('c.likeForComment', 'lc')
      .select([
        'c.id as "id"',
        'c.content as "content"',
        'c.createdAt as "createdAt"',
        'u.id as "userId"',
        'u.login as "userLogin"',
        'COUNT(CASE WHEN lc.likeStatus = :like THEN 1 END) as "likesCount"',
        'COUNT(CASE WHEN lc.likeStatus = :dislike THEN 1 END) as "dislikesCount"',
      ])
      .setParameters({
        like: LikeStatus.Like,
        dislike: LikeStatus.Dislike,
      })
      .groupBy('c.id,u.id,u.login');
  }

  private async getLikeStatus(
    commentId: number,
    userId: string,
  ): Promise<LikeStatus> {
    if (!userId) return LikeStatus.None;
    const status = await this.dataSource.manager
      .createQueryBuilder(LikeForComment, 'lc')
      .select('lc.likeStatus as "likeStatus"')
      .where('lc.userId = :userId', { userId: userId })
      .andWhere('lc.commentId = :commentId', { commentId: commentId })
      .getRawOne();
    return status ? status.likeStatus : LikeStatus.None;
  }

  private async getAllLikeStatuses(
    commentIds: number[],
    userId: string,
  ): Promise<{ commentId: number; likeStatus: LikeStatus }[]> {
    if (!userId) return [];
    return this.dataSource.manager
      .createQueryBuilder(LikeForComment, 'lc')
      .select(['lc.commentId as "commentId"', 'lc.likeStatus as "likeStatus"'])
      .where('lc.userId = :userId', { userId: userId })
      .andWhere('lc.commentId IN (:...commentIds)', { commentIds: commentIds })
      .getRawMany();
  }
}
