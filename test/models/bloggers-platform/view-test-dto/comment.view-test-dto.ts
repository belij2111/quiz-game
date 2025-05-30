import { LikeStatus } from '../../../../src/features/bloggers-platform/likes/api/models/enums/like-status.enum';

export class CommentViewTestDto {
  constructor(
    private _id: string,
    public content: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    public createdAt: string,
    public likesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: LikeStatus;
    },
  ) {}

  get id(): number {
    return Number(this._id);
  }
}
