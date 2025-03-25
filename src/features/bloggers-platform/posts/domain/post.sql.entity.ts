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
  addedAt: Date = new Date();
  userId: string;
  login: string;
}
