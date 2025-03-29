export class Comment {
  id: string;
  content: string;
  createdAt: Date = new Date();
  postId: string;
  userId: string;
}

export class CommentDto extends Comment {
  userLogin: string;
  likesCount: number;
  dislikesCount: number;
}
