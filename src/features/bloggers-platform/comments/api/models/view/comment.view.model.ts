import { CommentDto } from '../../../domain/comment.sql.entity';
import { LikeStatus } from '../../../../likes/api/models/enums/like-status-enum';

export class CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
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
    model.id = comment.id.toString();
    model.content = comment.content;
    model.commentatorInfo = {
      userId: comment.userId,
      userLogin: comment.userLogin,
    };
    model.createdAt = comment.createdAt.toISOString();
    model.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: currentStatus,
    };

    return model;
  }
}
