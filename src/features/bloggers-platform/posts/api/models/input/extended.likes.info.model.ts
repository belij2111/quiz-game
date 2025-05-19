import { LikeDetailsModel } from '../../../../likes/api/models/input/like.details.model';
import { LikeStatus } from '../../../../likes/api/models/enums/like-status.enum';

export class ExtendedLikesInfoModel {
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: LikeDetailsModel[];
  };
}
