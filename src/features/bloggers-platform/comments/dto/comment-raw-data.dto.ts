export class CommentRawDataDto {
  id: number;
  content: string;
  createdAt: Date;
  postId: number;
  userId: string;
  userLogin: string;
  likesCount: number;
  dislikesCount: number;
}
