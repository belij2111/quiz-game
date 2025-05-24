import { LikeStatus } from '../../../../likes/api/models/enums/like-status.enum';
import { CommentRawDataDto } from '../../../dto/comment-raw-data.dto';

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
    comment: CommentRawDataDto,
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
      likesCount: Number(comment.likesCount),
      dislikesCount: Number(comment.dislikesCount),
      myStatus: currentStatus,
    };

    return model;
  }
}
