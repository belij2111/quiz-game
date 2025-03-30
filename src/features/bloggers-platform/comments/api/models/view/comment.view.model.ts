import { CommentDto } from '../../../domain/comment.sql.entity';
import { LikeStatus } from '../../../../likes/api/models/enums/like-status-enum';

export class CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };

  static mapToView(
    comment: CommentDto,
    currentStatus: LikeStatus,
  ): CommentViewModel {
    const model = new CommentViewModel();
    model.id = comment.id;
    model.content = comment.content;
    model.commentatorInfo = {
      userId: comment.userId,
      userLogin: comment.userLogin,
    };
    model.createdAt = comment.createdAt;
    model.likesInfo = {
      likesCount: Number(comment.likesCount),
      dislikesCount: Number(comment.dislikesCount),
      myStatus: currentStatus,
    };

    return model;
  }
}
