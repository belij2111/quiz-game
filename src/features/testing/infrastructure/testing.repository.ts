import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogModelType,
} from '../../bloggers-platform/blogs/domain/blog.entity';
import {
  Post,
  PostModelType,
} from '../../bloggers-platform/posts/domain/post.entity';
import {
  Comment,
  CommentModelType,
} from '../../bloggers-platform/comments/domain/comment.entity';
import {
  Like,
  LikeModelType,
} from '../../bloggers-platform/likes/domain/like.entity';
import {
  SecurityDevices,
  SecurityDevicesModelType,
} from '../../user-accounts/security-devices/domain/security-devices.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(Like.name) private LikeModel: LikeModelType,
    @InjectModel(SecurityDevices.name)
    private SecurityDevicesModel: SecurityDevicesModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async deleteAllData() {
    await Promise.all([
      this.BlogModel.deleteMany(),
      this.PostModel.deleteMany(),
      this.CommentModel.deleteMany(),
      this.LikeModel.deleteMany(),
      this.SecurityDevicesModel.deleteMany(),
      this.dataSource.query(`TRUNCATE TABLE "users" RESTART IDENTITY`),
    ]);
  }
}
