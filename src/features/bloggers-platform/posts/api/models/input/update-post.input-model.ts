import { CreatePostInputModel } from './create-post.input-model';
import { PartialType } from '@nestjs/swagger';

export class UpdatePostInputModel extends PartialType(CreatePostInputModel) {}
