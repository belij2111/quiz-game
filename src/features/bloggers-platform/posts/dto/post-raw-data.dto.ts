export class PostRawDataDto {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  createdAt: Date;
  blogName: string;
  likesCount: number;
  dislikesCount: number;
  newestLikes: {
    addedAt: string;
    userId: string;
    login: string;
  }[];
}
