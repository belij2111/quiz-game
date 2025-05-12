import { IsNumber } from 'class-validator';
import { BlogIdIsExist } from '../../../../blogs/api/validation/blogId-is-exist.decorator';

export class BlogIdInputModel {
  @IsNumber({}, { message: 'Invalid BlogId' })
  @BlogIdIsExist()
  blogId: number;
}
