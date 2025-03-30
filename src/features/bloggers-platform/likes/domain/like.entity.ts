import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { LikeStatus } from '../api/models/enums/like-status-enum';

@Schema()
export class Like {
  @Prop({ type: Date, required: true, default: new Date() })
  createdAt: Date;

  @Prop({
    type: String,
    enum: LikeStatus,
    default: LikeStatus.None,
    required: true,
  })
  status: LikeStatus;

  @Prop({ type: String, required: true })
  authorId: string;

  @Prop({ type: String, required: true })
  parentId: string;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
export type LikeDocument = HydratedDocument<Like>;
export type LikeModelType = Model<LikeDocument>;
