import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { IsUUID } from 'class-validator';

export class BlogIdParamModel {
  @TrimIsString()
  @IsUUID('4', {
    message: 'Invalid BlogId',
  })
  blogId: string;
}
