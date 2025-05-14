import { Injectable, NotFoundException } from '@nestjs/common';
import { PostViewModel } from '../api/models/view/post.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../likes/api/models/enums/like-status-enum';
import { Post } from '../domain/post.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getById(currentUserId: string, id: number): Promise<PostViewModel> {
    const foundPost = await this.dataSource
      .getRepository(Post)
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'b')
      .select([
        'p.id as "id"',
        'p.title as "title"',
        'p.shortDescription as "shortDescription"',
        'p.content as "content"',
        'b.id as "blogId"',
        'b.name as "blogName"',
        'p.createdAt as "createdAt"',
      ])
      .where('p.id = :id', { id: id })
      .getRawOne();
    const currentStatus = LikeStatus.None;
    if (!foundPost) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return PostViewModel.mapToView(foundPost, currentStatus);
  }
}
