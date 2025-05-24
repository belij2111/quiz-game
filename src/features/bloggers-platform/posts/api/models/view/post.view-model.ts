import { LikeStatus } from '../../../../likes/api/models/enums/like-status.enum';
import { PostRawDataDto } from '../../../dto/post-raw-data.dto';

export class PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: {
      addedAt: string;
      userId: string;
      login: string;
    }[];
  };

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
