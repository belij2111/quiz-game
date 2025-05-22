import { BaseWithNumberIdEntity } from '../../../../core/entities/base-with-number-id.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { LikeStatus } from '../api/models/enums/like-status.enum';
import { User } from '../../../user-accounts/users/domain/user.entity';
import { Post } from '../../posts/domain/post.entity';
import { LikeDto } from '../dto/like.dto';

@Entity()
export class LikeForPost extends BaseWithNumberIdEntity {
  @Column({ type: 'enum', enum: LikeStatus, default: LikeStatus.None })
  likeStatus: LikeStatus = LikeStatus.None;

  @ManyToOne(() => User, (u) => u.likeForPost)
  @JoinColumn()
  public user: User;
  @Column({ type: 'uuid' })
  public userId: string;

  @ManyToOne(() => Post, (p) => p.likeForPost)
  @JoinColumn()
  public post: Post;
  @Column({ type: 'integer' })
  public postId: number;

  static create(dto: LikeDto, userId: string, postId: number): LikeForPost {
    const likeForPost = new this();
    likeForPost.likeStatus = dto.likeStatus;
    likeForPost.userId = userId;
    likeForPost.postId = postId;
    return likeForPost;
  }

  update(data: Partial<LikeForPost>) {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}
