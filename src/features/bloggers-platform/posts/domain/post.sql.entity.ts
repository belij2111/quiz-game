export class Post {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: Date = new Date();
}

export class PostDto extends Post {
  blogName: string;
  likesCount: number;
  dislikesCount: number;
  newestLikes: {
    addedAt: Date;
    userId: string;
    login: string;
  }[];
}
