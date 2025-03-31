import { LikeStatus } from '../api/models/enums/like-status-enum';

export class LikeForComment {
  id: string;
  createdAt: Date;
  status: LikeStatus;
  userId: string;
  commentId: string;
}
