import { Injectable } from '@nestjs/common';
import { BlogViewModel } from '../api/models/view/blog.view.model';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class BlogsSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getById(id: number): Promise<BlogViewModel | null> {
    const foundBlog = await this.dataSource.query(
      `SELECT * FROM "blogs"
        WHERE id = $1`,
      [id],
    );

    if (foundBlog.length === 0) return null;
    return BlogViewModel.mapToView(foundBlog[0]);
  }
}
