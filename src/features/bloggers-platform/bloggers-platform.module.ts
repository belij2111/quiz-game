import { Module } from '@nestjs/common';
import { PostsController } from './posts/api/posts.controller';
import { BlogsController } from './blogs/api/blogs.controller';
import { CommentsController } from './comments/api/comments.controller';
import { BlogIdIsExistConstraint } from './blogs/api/validation/blogId-is-exist.decorator';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { UuidProvider } from '../../core/helpers/uuid.provider';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.use-case';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog.use-case';
import { CreatePostUseCase } from './posts/application/use-cases/create-post.use-case';
import { UpdatePostUseCase } from './posts/application/use-cases/update-post.use-case';
import { DeletePostUseCase } from './posts/application/use-cases/delete-post.use-case';
import { UpdateLikeStatusForPostUseCase } from './posts/application/use-cases/update-like-status-for post.use-case';
import { CreateCommentUseCase } from './comments/application/use-cases/create-comment.use-case';
import { UpdateCommentUseCase } from './comments/application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './comments/application/use-cases/delete-comment.use-case';
import { UpdateLikeStatusForCommentUseCase } from './comments/application/use-cases/update-like-status-for-comment.use-case';
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blog-by-id.query';
import { GetBlogsQueryHandler } from './blogs/application/queries/get-blogs.query';
import { GetPostByIdHandler } from './posts/application/queries/get-post-by-id.query';
import { GetPostsForSpecifiedBlogQueryHandler } from './posts/application/queries/get-posts-for-specified-blog.query';
import { GetPostsQueryHandler } from './posts/application/queries/get-posts.query';
import { GetCommentByIdQueryHandler } from './comments/application/queries/get-comment-by-id.query';
import { GetCommentsForSpecificPostQueryHandler } from './comments/application/queries/get-comments-for-specified-post.query';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './blogs/domain/blog.entity';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/blogs.query-repository';
import { Post } from './posts/domain/post.entity';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/posts.query-repository';
import { Comment } from './comments/domain/comment.entity';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from './comments/infrastructure/comments.query-repository';
import { LikeForComment } from './likes/domain/like-for-comment.entity';
import { LikesForCommentRepository } from './likes/infrastructure/likes-for-comment.repository';
import { LikeForPost } from './likes/domain/like-for-post.entity';
import { LikesForPostRepository } from './likes/infrastructure/likes-for-post.repository';

const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  UpdateLikeStatusForPostUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  UpdateLikeStatusForCommentUseCase,
];
const queries = [
  GetBlogByIdQueryHandler,
  GetBlogsQueryHandler,
  GetPostByIdHandler,
  GetPostsForSpecifiedBlogQueryHandler,
  GetPostsQueryHandler,
  GetCommentByIdQueryHandler,
  GetCommentsForSpecificPostQueryHandler,
];
const repositories = [
  BlogsRepository,
  BlogsQueryRepository,
  PostsRepository,
  PostsQueryRepository,
  CommentsRepository,
  CommentsQueryRepository,
  LikesForCommentRepository,
  LikesForPostRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Blog,
      Post,
      Comment,
      LikeForComment,
      LikeForPost,
    ]),
    CqrsModule,
    UserAccountsModule,
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogIdIsExistConstraint,
    UuidProvider,
    ...useCases,
    ...queries,
    ...repositories,
  ],
})
export class BloggersPlatformModule {}
