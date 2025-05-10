import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(blog: Blog) {
    const result = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Blog)
      .values(blog)
      .returning('id')
      .execute();
    return result.raw[0].id;
  }

  async update(foundBlog: Blog): Promise<boolean | null> {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(Blog)
      .set(foundBlog)
      .where('id = :id', { id: foundBlog.id })
      .execute();
    return (result.affected ?? 0) > 0 ? true : null;
  }

  async findByIdOrNotFoundFail(id: number): Promise<Blog> {
    const foundBlog = await this.findById(id);
    if (!foundBlog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
    return foundBlog;
  }

  async findById(id: number): Promise<Blog | null> {
    return await this.dataSource
      .createQueryBuilder()
      .select('b')
      .from(Blog, 'b')
      .where('b.id = :id', { id: id })
      .getOne();
  }

  async delete(id: number) {
    const result = await this.dataSource
      .createQueryBuilder()
      .softDelete()
      .from(Blog)
      .where('id = :id', { id: id })
      .execute();
    return (result.affected ?? 0) > 0 ? true : null;
  }

  async blogIdIsExist(id: number) {
    const result = await this.dataSource
      .createQueryBuilder()
      .from(Blog, 'b')
      .where('b.id = :id', { id: id })
      .getCount();
    return result > 0;
  }
}
