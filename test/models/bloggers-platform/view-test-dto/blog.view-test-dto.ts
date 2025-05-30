export class BlogViewTestDto {
  constructor(
    private _id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}

  get id(): number {
    return Number(this._id);
  }
}
