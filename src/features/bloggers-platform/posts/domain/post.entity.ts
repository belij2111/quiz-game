import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { LikeStatus } from '../../likes/api/models/enums/like-status-enum';

@Schema({ _id: false })
class NewestLikes {
  @Prop({ type: Date, required: true, default: new Date() })
  addedAt: Date;
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  login: string;
}

const NewestLikesSchema = SchemaFactory.createForClass(NewestLikes);

@Schema({ _id: false })
class ExtendedLikesInfo {
  @Prop({ type: Number, default: 0 })
  likesCount: number;
  @Prop({ type: Number, default: 0 })
  dislikesCount: number;
  @Prop({ type: String, enum: LikeStatus, default: LikeStatus.None })
  myStatus: string;
  @Prop({ type: [NewestLikesSchema], required: true })
  newestLikes: NewestLikes[];
}

const ExtendedLikesInfoSchema = SchemaFactory.createForClass(ExtendedLikesInfo);

@Schema()
export class Post {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: Date, required: true, default: new Date() })
  createdAt: Date;

  @Prop({ type: ExtendedLikesInfoSchema, required: true })
  extendedLikesInfo: ExtendedLikesInfo;
}

export const PostSchema = SchemaFactory.createForClass(Post);
export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument>;
