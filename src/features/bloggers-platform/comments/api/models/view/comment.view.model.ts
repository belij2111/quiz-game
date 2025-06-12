import { LikeStatus } from '../../../../likes/api/models/enums/like-status.enum';
import { CommentRawDataDto } from '../../../dto/comment-raw-data.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CommentatorInfo {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userLogin: string;
}

export class LikeInfo {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    description: 'Total likes for parent item',
    required: false,
  })
  likesCount: number;

  @ApiProperty({
    type: 'integer',
    format: 'int32',
    description: 'Total dislikes for parent item',
    required: false,
  })
  dislikesCount: number;

  @ApiProperty({
    enum: LikeStatus,
    required: false,
    description: 'Sent None if you want to unlike/un dislike',
  })
  myStatus: LikeStatus;
}

export class CommentViewModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: CommentatorInfo })
  commentatorInfo: CommentatorInfo;

  @ApiProperty({ format: 'date-time', required: false })
  createdAt: string;

  @ApiProperty({ type: LikeInfo, required: false })
  likesInfo: LikeInfo;

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
