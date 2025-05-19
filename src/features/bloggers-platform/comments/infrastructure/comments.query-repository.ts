import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewModel } from '../api/models/view/comment.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../likes/api/models/enums/like-status.enum';
import { Comment } from '../domain/comment.entity';
import { GetCommentQueryParams } from '../api/models/input/create-comment.input-model';
import { SortDirection } from '../../../../core/models/base-query-params.input-model';
import { PaginatedViewModel } from '../../../../core/models/base-paginated.view-model';

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
    const currentStatus = LikeStatus.None;
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
    const direction = sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';
    if (sortBy && sortDirection) {
      query.orderBy(`"${sortBy}"`, direction);
    }
    query.offset(inputQuery.calculateSkip()).limit(inputQuery.pageSize);
    const foundComments = await query.getRawMany();
    if (!foundComments) {
      throw new NotFoundException(
        `Comments on the Post with id ${postId} not found`,
      );
    }
    const totalCount = await query.getCount();
    const currentStatus = LikeStatus.None;
    const items = foundComments.map((comment) =>
      CommentViewModel.mapToView(comment, currentStatus),
    );
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
      .select([
        'c.id as "id"',
        'c.content as "content"',
        'c.createdAt as "createdAt"',
        'u.id as "userId"',
        'u.login as "userLogin"',
      ]);
  }
}
