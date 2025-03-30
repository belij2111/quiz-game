import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { LikeStatus } from '../../likes/api/models/enums/like-status-enum';

@Schema({ _id: false })
class CommentatorInfo {
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  userLogin: string;
}

const CommentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo);

@Schema({ _id: false })
class LikesInfo {
  @Prop({ type: Number, default: 0 })
  likesCount: number;
  @Prop({ type: Number, default: 0 })
  dislikesCount: number;
  @Prop({ type: String, enum: LikeStatus, default: LikeStatus.None })
  myStatus: string;
}

const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);

@Schema()
export class Comment {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: Date, required: true, default: new Date() })
  createdAt: Date;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: LikesInfoSchema, required: true })
  likesInfo: LikesInfo;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument>;
