import { IsEnum } from 'class-validator';

import { LikeStatus } from '../enums/like-status.enum';

export class LikeInputModel {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
