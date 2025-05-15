import { IsNumberString } from 'class-validator';
import { BlogIdIsExist } from '../../../../blogs/api/validation/blogId-is-exist.decorator';

export class BlogIdInputModel {
  @IsNumberString({}, { message: 'Invalid BlogId' })
  @BlogIdIsExist()
  blogId: number;
}
