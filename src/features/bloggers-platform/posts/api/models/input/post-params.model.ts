import { IsNumberString } from 'class-validator';

export class PostParamsModel {
  @IsNumberString({}, { message: 'Invalid BlogId' })
  blogId: number;

  @IsNumberString({}, { message: 'Invalid PostId' })
  postId: number;
}
