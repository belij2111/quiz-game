import { Injectable, NotFoundException } from '@nestjs/common';
import { Blog, BlogDocument } from '../domain/blog.entity';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { BlogCreateModel } from '../api/models/input/create-blog.input.model';

@Injectable()
export class BlogsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(newBlog: Blog): Promise<string> {
    const result = await this.dataSource.query(
      `INSERT INTO "blogs"("name", "description", "websiteUrl", "createdAt", "isMembership")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
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

  async update(
    foundBlog: BlogDocument,
    blogUpdatedModel: BlogCreateModel,
  ): Promise<boolean | null> {
    const result = await this.dataSource.query(
      `UPDATE "blogs"
       SET "name"        = $1,
           "description" = $2,
           "websiteUrl"  = $3
       WHERE "id" = $4`,
      [
        blogUpdatedModel.name,
        blogUpdatedModel.description,
        blogUpdatedModel.websiteUrl,
        foundBlog.id,
      ],
    );
    return result.rowCount !== 0;
  }

  async findByIdOrNotFoundFail(id: string): Promise<BlogDocument> {
    const foundBlog = await this.findById(id);
    if (!foundBlog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
    return foundBlog;
  }

  async findById(id: string): Promise<BlogDocument | null> {
    const result = await this.dataSource.query(
      `SELECT *
       FROM "blogs"
       WHERE "id" = $1`,
      [id],
    );
    return result[0];
  }
}
