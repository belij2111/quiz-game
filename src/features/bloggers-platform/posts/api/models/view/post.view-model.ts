import { LikeStatus } from '../../../../likes/api/models/enums/like-status.enum';
import { PostRawDataDto } from '../../../dto/post-raw-data.dto';
import { ApiProperty } from '@nestjs/swagger';

export class NewestLike {
  @ApiProperty({
    format: 'date-time',
    required: false,
  })
  addedAt: string;

  @ApiProperty({ type: String, nullable: true, required: false })
  userId: string | null;

  @ApiProperty({ type: String, nullable: true, required: false })
  login: string | null;
}

export class ExtendedLikesInfo {
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
    description: 'Send None if you want to unlike/un dislike',
  })
  myStatus: LikeStatus;

  @ApiProperty({
    required: false,
    description: 'Last 3 likes (status "Like")',
    nullable: true,
    type: [NewestLike],
  })
  newestLikes: NewestLike[] | null;
}

export class PostViewModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  blogId: string;

  @ApiProperty()
  blogName: string;

  @ApiProperty({ format: 'date-time', required: false })
  createdAt: string;

  @ApiProperty({ type: [ExtendedLikesInfo], required: false })
  extendedLikesInfo: ExtendedLikesInfo;

  static mapToView(
    post: PostRawDataDto,
    currentStatus: LikeStatus,
  ): PostViewModel {
    const model = new PostViewModel();
    const newestLikes =
      Array.isArray(post.newestLikes) && post.newestLikes.length > 0
        ? post.newestLikes.slice(0, 3)
        : [];
    model.id = post.id.toString();
    model.title = post.title;
    model.shortDescription = post.shortDescription;
    model.content = post.content;
    model.blogId = post.blogId.toString();
    model.blogName = post.blogName;
    model.createdAt = post.createdAt.toISOString();
    model.extendedLikesInfo = {
      likesCount: Number(post.likesCount),
      dislikesCount: Number(post.dislikesCount),
      myStatus: currentStatus,
      newestLikes: newestLikes,
    };
    return model;
  }
}
