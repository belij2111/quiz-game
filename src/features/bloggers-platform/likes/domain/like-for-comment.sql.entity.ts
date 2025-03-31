import { LikeStatus } from '../api/models/enums/like-status-enum';

export class LikeForComment {
  id: string;
  createdAt: Date = new Date();
  status: LikeStatus;
  userId: string;
  commentId: string;
}
