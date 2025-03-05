import { Injectable } from '@nestjs/common';
import { Blog } from '../domain/blog.entity';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class BlogsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(newBlog: Blog): Promise<string> {
    const result = await this.dataSource.query(
      `INSERT INTO "blogs"("name","description","websiteUrl","createdAt","isMembership")
      VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [
        newBlog.name,
        newBlog.description,
        newBlog.websiteUrl,
        newBlog.createdAt,
        newBlog.isMembership,
      ],
    );
    return result[0].id;
  }
}
