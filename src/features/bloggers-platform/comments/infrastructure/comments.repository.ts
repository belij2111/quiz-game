import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '../domain/comment.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(comment: Comment): Promise<string> {
    const result = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Comment)
      .values(comment)
      .returning('id')
      .execute();
    return result.raw[0].id;
  }

  async update(foundComment: Comment): Promise<boolean | null> {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(Comment)
      .set(foundComment)
      .where('id = :id', { id: foundComment.id })
      .execute();
    return (result.affected ?? 0) > 0 ? true : null;
  }

  async delete(id: number): Promise<boolean | null> {
    const result = await this.dataSource
      .createQueryBuilder()
      .softDelete()
      .from(Comment)
      .where('id = :id', { id: id })
      .execute();
    return (result.affected ?? 0) > 0 ? true : null;
  }

  async findByIdOrNotFoundFail(id: number): Promise<Comment> {
    const foundComment = await this.findById(id);
    if (!foundComment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return foundComment;
  }

  private async findById(id: number): Promise<Comment | null> {
    return await this.dataSource.manager
      .createQueryBuilder(Comment, 'c')
      .select('c')
      .where('c.id = :id', { id: id })
      .getOne();
  }
}
