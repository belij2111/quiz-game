import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { Post, PostSchema } from './posts/domain/post.entity';
import { PostsController } from './posts/api/posts.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/blogs.query-repository';
import { PostsService } from './posts/application/posts.service';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/posts.query-repository';
import { BlogsController } from './blogs/api/blogs.controller';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsService } from './comments/application/comments.service';
import { CommentsQueryRepository } from './comments/infrastructure/comments.query-repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { Like, LikeSchema } from './likes/domain/like.entity';
import { LikesRepository } from './likes/infrastructure/likes.repository';
import { BlogIdIsExistConstraint } from './blogs/api/validation/blogId-is-exist.decorator';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { BlogsSqlRepository } from './blogs/infrastructure/blogs.sql.repository';
import { BlogsSqlQueryRepository } from './blogs/infrastructure/blogs.sql.query-repository';
import { PostsSqlRepository } from './posts/infrastructure/posts.sql.repository';
import { PostsSqlQueryRepository } from './posts/infrastructure/posts.sql.query-repository';
import { UuidProvider } from '../../core/helpers/uuid.provider';
import { CommentsSqlRepository } from './comments/infrastructure/comments.sql.repository';
import { CommentsSqlQueryRepository } from './comments/infrastructure/comments.sql.query-repository';
import { LikesForCommentSqlRepository } from './likes/infrastructure/likes-for-comment.sql.repository';
import { LikesForPostSqlRepository } from './likes/infrastructure/likes-for-post.sql.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    UserAccountsModule,
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsSqlRepository,
    BlogsQueryRepository,
    BlogsSqlQueryRepository,
    PostsService,
    PostsRepository,
    PostsSqlRepository,
    PostsQueryRepository,
    PostsSqlQueryRepository,
    CommentsService,
    CommentsQueryRepository,
    CommentsSqlQueryRepository,
    CommentsRepository,
    CommentsSqlRepository,
    LikesRepository,
    LikesForCommentSqlRepository,
    LikesForPostSqlRepository,
    BlogIdIsExistConstraint,
    UuidProvider,
  ],
})
export class BloggersPlatformModule {}
