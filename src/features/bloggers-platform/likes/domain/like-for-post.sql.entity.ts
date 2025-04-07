import { LikeStatus } from '../api/models/enums/like-status-enum';

export class LikeForPost {
  id: string;
  createdAt: Date;
  status: LikeStatus;
  userId: string;
  postId: string;
}
