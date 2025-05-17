import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseWithNumberIdEntity } from '../../../../core/entities/base-with-number-id.entity';
import { Post } from '../../posts/domain/post.entity';
import { User } from '../../../user-accounts/users/domain/user.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Entity()
export class Comment extends BaseWithNumberIdEntity {
  @Column({ type: 'varchar', collation: 'C' })
  content: string;

  @ManyToOne(() => Post, (p) => p.comment)
  @JoinColumn()
  public post: Post;
  @Column({ type: 'integer' })
  public postId: number;

  @ManyToOne(() => User, (u) => u.comment)
  @JoinColumn()
  user: User;
  @Column({ type: 'uuid' })
  public userId: string;

  static create(
    dto: CreateCommentDto,
    postId: number,
    userId: string,
  ): Comment {
    const comment = new this();
    comment.content = dto.content;
    comment.postId = postId;
    comment.userId = userId;
    return comment;
  }

  update(data: Partial<Comment>) {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}
