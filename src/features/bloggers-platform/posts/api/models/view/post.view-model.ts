import { PostDto } from '../../../domain/post.sql.entity';
import { LikeStatus } from '../../../../likes/api/models/enums/like-status-enum';

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
    model.id = post.id.toString();
    model.title = post.title;
    model.shortDescription = post.shortDescription;
    model.content = post.content;
    model.blogId = post.blogId.toString();
    model.blogName = post.blogName;
    model.createdAt = post.createdAt.toISOString();
    model.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: currentStatus,
      newestLikes: newestLikes,
    };
    return model;
  }
}
