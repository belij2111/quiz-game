import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { LikeForComment } from '../domain/like-for-comment.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesForCommentRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(like: LikeForComment): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(LikeForComment)
      .values(like)
      .execute();
  }

  async update(foundLike: LikeForComment): Promise<boolean | null> {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(LikeForComment)
      .set(foundLike)
      .where('id = :id', { id: foundLike.id })
      .execute();
    return (result.affected ?? 0) > 0 ? true : null;
  }

  async find(
    userId: string,
    commentId: number,
  ): Promise<LikeForComment | null> {
    return await this.dataSource.manager
      .createQueryBuilder(LikeForComment, 'lc')
      .select('lc')
      .where('lc.userId = :userId ', { userId: userId })
      .andWhere('lc.commentId = :commentId', { commentId: commentId })
      .getOne();
  }
}
