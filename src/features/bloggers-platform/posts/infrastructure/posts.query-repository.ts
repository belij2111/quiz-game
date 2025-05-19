import { Injectable, NotFoundException } from '@nestjs/common';
import { PostViewModel } from '../api/models/view/post.view-model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../likes/api/models/enums/like-status.enum';
import { Post } from '../domain/post.entity';
import { GetPostQueryParams } from '../api/models/input/create-post.input-model';
import { SortDirection } from '../../../../core/models/base-query-params.input-model';
import { PaginatedViewModel } from '../../../../core/models/base-paginated.view-model';

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
    const currentStatus = LikeStatus.None;
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
    const direction = sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';
    if (sortBy && sortDirection) {
      query.orderBy(`"${sortBy}"`, direction);
    }
    query.offset(inputQuery.calculateSkip()).limit(inputQuery.pageSize);
    const foundPosts = await query.getRawMany();
    if (foundPosts.length === 0) {
      throw new NotFoundException(`Post with id ${blogId} not found`);
    }
    const totalCount = await query.getCount();
    const currentStatus = LikeStatus.None;
    const items = foundPosts.map((post) =>
      PostViewModel.mapToView(post, currentStatus),
    );
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
    const direction = sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';
    if (sortBy && sortDirection) {
      query.orderBy(`"${sortBy}"`, direction);
    }
    query.offset(inputQuery.calculateSkip()).limit(inputQuery.pageSize);
    const foundPosts = await query.getRawMany();
    if (foundPosts.length === 0) {
      throw new NotFoundException(`Post not found`);
    }
    const totalCount = await query.getCount();
    const currentStatus = LikeStatus.None;
    const items = foundPosts.map((post) =>
      PostViewModel.mapToView(post, currentStatus),
    );
    return PaginatedViewModel.mapToView({
      pageNumber: inputQuery.pageNumber,
      pageSize: inputQuery.pageSize,
      totalCount,
      items,
    });
  }

  private getBaseQuery() {
    return this.dataSource
      .getRepository(Post)
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b')
      .select([
        'p.id as "id"',
        'p.title as "title"',
        'p.shortDescription as "shortDescription"',
        'p.content as "content"',
        'b.id as "blogId"',
        'b.name as "blogName"',
        'p.createdAt as "createdAt"',
      ]);
  }
}
