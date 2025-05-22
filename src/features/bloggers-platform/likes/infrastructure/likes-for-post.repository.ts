import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeForPost } from '../domain/like-for-post.entity';

@Injectable()
export class LikesForPostRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(like: LikeForPost): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(LikeForPost)
      .values(like)
      .execute();
  }

  async update(foundLike: LikeForPost): Promise<boolean | null> {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(LikeForPost)
      .set(foundLike)
      .where('id = :id', { id: foundLike.id })
      .execute();
    return (result.affected ?? 0) > 0 ? true : null;
  }

  async find(userId: string, postId: number): Promise<LikeForPost | null> {
    return await this.dataSource
      .createQueryBuilder()
      .from(LikeForPost, 'lp')
      .select('lp')
      .where('lp.userId = :userId ', { userId: userId })
      .andWhere('lp.postId = :postId', { postId: postId })
      .getOne();
  }
}
