import { Injectable } from '@nestjs/common';
import { BlogViewModel } from '../api/models/view/blog.view.model';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getById(id: string): Promise<BlogViewModel | null> {
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
    if (!foundBlog) return null;
    return BlogViewModel.mapToView(foundBlog);
  }
}
