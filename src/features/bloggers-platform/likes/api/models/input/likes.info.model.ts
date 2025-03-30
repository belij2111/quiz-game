import { LikeStatus } from '../enums/like-status-enum';

export class LikesInfoModel {
  currentStatus: LikeStatus;
  likesCount: number;
  dislikesCount: number;
}
