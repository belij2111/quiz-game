import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewModel } from '../api/models/view/comment.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../likes/api/models/enums/like-status-enum';
import { Comment } from '../domain/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getById(currentUserId: string, id: string): Promise<CommentViewModel> {
    const query = this.getBaseQuery();
    query.where('c.id = :id', { id: id });
    const foundComment = await query.getRawOne();
    if (!foundComment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    const currentStatus = LikeStatus.None;
    return CommentViewModel.mapToView(foundComment, currentStatus);
  }

  private getBaseQuery() {
    return this.dataSource.manager
      .createQueryBuilder(Comment, 'c')
      .leftJoinAndSelect('c.user', 'u')
      .select([
        'c.id as "id"',
        'c.content as "content"',
        'c.createdAt as "createdAt"',
        'u.id as "userId"',
        'u.login as "userLogin"',
      ]);
  }
}
