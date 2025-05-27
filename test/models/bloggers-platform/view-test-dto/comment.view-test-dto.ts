import { LikeStatus } from '../../../../src/features/bloggers-platform/likes/api/models/enums/like-status.enum';

export class CommentViewTestDto {
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
}
