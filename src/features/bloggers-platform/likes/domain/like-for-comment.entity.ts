import { LikeStatus } from '../api/models/enums/like-status.enum';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseWithNumberIdEntity } from '../../../../core/entities/base-with-number-id.entity';
import { User } from '../../../user-accounts/users/domain/user.entity';
import { Comment } from '../../comments/domain/comment.entity';
import { LikeDto } from '../api/dto/like.dto';

@Entity()
export class LikeForComment extends BaseWithNumberIdEntity {
  @Column({ type: 'enum', enum: LikeStatus, default: LikeStatus.None })
  likeStatus: LikeStatus = LikeStatus.None;

  @ManyToOne(() => User, (u) => u.likeForComment)
  @JoinColumn()
  public user: User;
  @Column({ type: 'uuid' })
  public userId: string;

  @ManyToOne(() => Comment, (c) => c.likeForComment)
  @JoinColumn()
  public comment: Comment;
  @Column({ type: 'integer' })
  public commentId: number;

  static create(
    dto: LikeDto,
    userId: string,
    commentId: number,
  ): LikeForComment {
    const likeForComment = new this();
    likeForComment.likeStatus = dto.likeStatus;
    likeForComment.userId = userId;
    likeForComment.commentId = commentId;
    return likeForComment;
  }
}
