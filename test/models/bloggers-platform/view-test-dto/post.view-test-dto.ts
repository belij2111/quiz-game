import { LikeStatus } from '../../../../src/features/bloggers-platform/likes/api/models/enums/like-status.enum';

export class PostViewTestDto {
  constructor(
    private _id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: LikeStatus;
      newestLikes: {
        addedAt: string;
        userId: string;
        login: string;
      }[];
    },
  ) {}
  get id(): number {
    return Number(this._id);
  }
}
