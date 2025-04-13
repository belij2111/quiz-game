import { Module } from '@nestjs/common';
import { PostsController } from './posts/api/posts.controller';
import { BlogsController } from './blogs/api/blogs.controller';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsService } from './comments/application/comments.service';
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
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.use-case';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog.use-case';
import { CreatePostUseCase } from './posts/application/use-cases/create-post.use-case';
import { UpdatePostUseCase } from './posts/application/use-cases/update-post.use-case';
import { DeletePostUseCase } from './posts/application/use-cases/delete-post.use-case';
import { UpdateLikeStatusUseCase } from './posts/application/use-cases/update-like-status.use-case';
import { CreateCommentUseCase } from './comments/application/use-cases/create-comment.use-case';
import { UpdateCommentUseCase } from './comments/application/use-cases/update-comment.use-case';

const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  UpdateLikeStatusUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
];

@Module({
  imports: [CqrsModule, UserAccountsModule],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    ...useCases,
    BlogsSqlRepository,
    BlogsSqlQueryRepository,
    PostsSqlRepository,
    PostsSqlQueryRepository,
    CommentsService,
    CommentsSqlQueryRepository,
    CommentsSqlRepository,
    LikesForCommentSqlRepository,
    LikesForPostSqlRepository,
    BlogIdIsExistConstraint,
    UuidProvider,
  ],
})
export class BloggersPlatformModule {}
