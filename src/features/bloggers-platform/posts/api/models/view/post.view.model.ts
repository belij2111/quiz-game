import { PostDto } from '../../../domain/post.sql.entity';
import { LikeStatus } from '../../../../likes/api/models/enums/like-status-enum';

export class PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: {
      addedAt: Date;
      userId: string;
      login: string;
    }[];
  };

  static mapToView(post: PostDto, currentStatus: LikeStatus): PostViewModel {
    const model = new PostViewModel();
    const newestLikes =
      Array.isArray(post.newestLikes) && post.newestLikes.length > 0
        ? post.newestLikes.slice(0, 3)
        : [];
    model.id = post.id;
    model.title = post.title;
    model.shortDescription = post.shortDescription;
    model.content = post.content;
    model.blogId = post.blogId;
    model.blogName = post.blogName;
    model.createdAt = post.createdAt;
    model.extendedLikesInfo = {
      likesCount: Number(post.likesCount),
      dislikesCount: Number(post.dislikesCount),
      myStatus: currentStatus,
      newestLikes: newestLikes,
    };
    return model;
  }
}
