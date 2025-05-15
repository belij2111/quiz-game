import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '../domain/post.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(post: Post) {
    const result = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values(post)
      .returning('id')
      .execute();
    return result.raw[0].id;
  }

  async update(foundPost: Post): Promise<boolean | null> {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(Post)
      .set(foundPost)
      .where('id = :id', { id: foundPost.id })
      .execute();
    return (result.affected ?? 0) > 0 ? true : null;
  }

  async delete(id: number): Promise<boolean | null> {
    const result = await this.dataSource
      .createQueryBuilder()
      .softDelete()
      .from(Post)
      .where('id = :id', { id: id })
      .execute();
    return (result.affected ?? 0) > 0 ? true : null;
  }

  async findByIdOrNotFoundFail(id: number): Promise<Post> {
    const foundPost = await this.findById(id);
    if (!foundPost) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return foundPost;
  }

  private async findById(id: number): Promise<Post | null> {
    return await this.dataSource
      .getRepository(Post)
      .createQueryBuilder('p')
      .select('p')
      .where('p.id = :id', { id: id })
      .getOne();
  }
}
