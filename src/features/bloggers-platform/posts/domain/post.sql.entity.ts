export class Post {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date = new Date();
  likesCount: number;
  dislikesCount: number;
  addedAt: Date = new Date();
  userId: string;
  login: string;
}
