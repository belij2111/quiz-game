import { Injectable } from '@nestjs/common';
import { BlogViewModel } from '../api/models/view/blog.view.model';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { GetBlogsQueryParams } from '../api/models/input/create-blog.input.model';
import { PaginatedViewModel } from '../../../../core/models/base.paginated.view.model';

@Injectable()
export class BlogsSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getById(id: string): Promise<BlogViewModel | null> {
    const foundBlog = await this.dataSource.query(
      `SELECT * FROM "blogs"
        WHERE id = $1`,
      [id],
    );

    if (foundBlog.length === 0) return null;
    return BlogViewModel.mapToView(foundBlog[0]);
  }

  async getAll(
    inputQuery: GetBlogsQueryParams,
  ): Promise<PaginatedViewModel<BlogViewModel[]>> {
    const searchNameTerm = inputQuery.searchNameTerm || '';
    const query = `
    SELECT * FROM "blogs"
    WHERE "name" ILIKE $1
    ORDER BY "${inputQuery.sortBy}" ${inputQuery.sortDirection}
    LIMIT $2 OFFSET $3
    `;
    const values = [
      `%${searchNameTerm}%`,
      inputQuery.pageSize,
      inputQuery.calculateSkip(),
    ];
    const foundBlogs = await this.dataSource.query(query, values);
    const countQuery = `
    SELECT COUNT(*) FROM "blogs"
    WHERE "name" ILIKE $1
    `;
    const totalCountResult = await this.dataSource.query(countQuery, [
      `%${searchNameTerm}%`,
    ]);
    const totalCount = parseInt(totalCountResult[0].count, 10);
    const items = foundBlogs.map(BlogViewModel.mapToView);
    return PaginatedViewModel.mapToView({
      pageNumber: inputQuery.pageNumber,
      pageSize: inputQuery.pageSize,
      totalCount,
      items,
    });
  }
}
