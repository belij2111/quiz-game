import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogViewModel } from '../api/models/view/blog.view-model';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Blog } from '../domain/blog.entity';
import { PaginatedViewModel } from '../../../../core/models/base-paginated.view-model';
import { GetBlogsQueryParams } from '../api/models/input/create-blog.input-model';
import { SortDirection } from '../../../../core/models/base-query-params.input-model';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getById(id: number): Promise<BlogViewModel> {
    const foundBlog = await this.dataSource
      .createQueryBuilder()
      .select([
        'b.id as "id"',
        'b.name as "name"',
        'b.description as "description"',
        'b.websiteUrl as "websiteUrl"',
        'b.createdAt as "createdAt"',
        'b.isMembership as "isMembership"',
      ])
      .from(Blog, 'b')
      .where('b.id = :id', { id: id })
      .getRawOne();
    if (!foundBlog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
    return BlogViewModel.mapToView(foundBlog);
  }

  async getAll(
    inputQuery: GetBlogsQueryParams,
  ): Promise<PaginatedViewModel<BlogViewModel[]>> {
    const { searchNameTerm, sortBy, sortDirection } = inputQuery;
    const query = this.dataSource
      .createQueryBuilder()
      .from(Blog, 'b')
      .select([
        'b.id as "id"',
        'b.name as "name"',
        'b.description as "description"',
        'b.websiteUrl as "websiteUrl"',
        'b.createdAt as "createdAt"',
        'b.isMembership as "isMembership"',
      ]);
    if (searchNameTerm) {
      query.where('b.name iLike :name', { name: `%${searchNameTerm}%` });
    }
    const direction = sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';
    if (sortBy && sortDirection) {
      query.orderBy(`b.${sortBy}`, direction);
    }
    query.skip(inputQuery.calculateSkip()).take(inputQuery.pageSize);

    const foundBlogs = await query.getRawMany();
    const totalCount = await query.getCount();

    const items = foundBlogs.map(BlogViewModel.mapToView);
    return PaginatedViewModel.mapToView({
      pageNumber: inputQuery.pageNumber,
      pageSize: inputQuery.pageSize,
      totalCount,
      items,
    });
  }
}
