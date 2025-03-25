import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { IsUUID } from 'class-validator';

export class PostParamsModel {
  @TrimIsString()
  @IsUUID('4', {
    message: 'Invalid BlogId',
  })
  blogId: string;

  @TrimIsString()
  @IsUUID('4', {
    message: 'Invalid PostId',
  })
  postId: string;
}
