import { IsEnum } from 'class-validator';

import { LikeStatus } from '../enums/like-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class LikeInputModel {
  @IsEnum(LikeStatus)
  @ApiProperty({
    enum: LikeStatus,
    description: 'Send None if you want to un like/un dislike',
    required: false,
  })
  likeStatus: LikeStatus;
}
