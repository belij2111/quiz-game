import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogViewModel } from './models/view/blog.view-model';
import {
  CreateBlogInputModel,
  GetBlogsQueryParams,
} from './models/input/create-blog.input-model';
import {
  CreatePostInputModel,
  GetPostQueryParams,
} from '../../posts/api/models/input/create-post.input-model';
import { PostViewModel } from '../../posts/api/models/view/post.view-model';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { ApiBasicAuth } from '@nestjs/swagger';
import { PaginatedViewModel } from '../../../../core/models/base-paginated.view-model';
import { CurrentUserId } from '../../../../core/decorators/param/current-user-id.param-decorator';
import { IdentifyUser } from '../../../../core/decorators/param/identify-user.param-decorator';
import { JwtOptionalAuthGuard } from '../../guards/jwt-optional-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/use-cases/create-blog.use-case';
import { UpdateBlogCommand } from '../application/use-cases/update-blog.use-case';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog.use-case';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.use-case';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query';
import { GetBlogsQuery } from '../application/queries/get-blogs.query';
import { GetPostByIdQuery } from '../../posts/application/queries/get-post-by-id.query';
import { GetPostsForSpecifiedBlogQuery } from '../../posts/application/queries/get-posts-for-specified-blog.query';
import { IdIsNumberValidationPipe } from '../../../../core/pipes/id-is-number.validation-pipe';
import { UpdateBlogInputModel } from './models/input/update-blog.input-model';
import { UpdatePostInputModel } from '../../posts/api/models/input/update-post.input-model';
import { UpdatePostCommand } from '../../posts/application/use-cases/update-post.use-case';
import { DeletePostCommand } from '../../posts/application/use-cases/delete-post.use-case';

@Controller('sa/blogs')
export class BlogsAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getAll(
    @Query()
    inputQuery: GetBlogsQueryParams,
  ): Promise<PaginatedViewModel<BlogViewModel[]>> {
    return await this.queryBus.execute(new GetBlogsQuery(inputQuery));
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async create(@Body() blogCreateModel: CreateBlogInputModel) {
    const createdBlogId = await this.commandBus.execute(
      new CreateBlogCommand(blogCreateModel),
    );
    return await this.queryBus.execute(new GetBlogByIdQuery(createdBlogId));
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id', IdIsNumberValidationPipe) id: number,
    @Body() updateBlogModel: UpdateBlogInputModel,
  ) {
    await this.commandBus.execute(new UpdateBlogCommand(id, updateBlogModel));
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', IdIsNumberValidationPipe) id: number) {
    await this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlogId(
    @CurrentUserId() currentUserId: string,
    @Param('blogId', IdIsNumberValidationPipe) blogId: number,
    @Body() body: CreatePostInputModel,
  ): Promise<PostViewModel | null> {
    const createdPostId = await this.commandBus.execute(
      new CreatePostCommand(body, blogId),
    );
    return await this.queryBus.execute(
      new GetPostByIdQuery(currentUserId, createdPostId),
    );
  }

  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsByBlogId(
    @IdentifyUser() identifyUser: string,
    @Param('blogId', IdIsNumberValidationPipe) blogId: number,
    @Query() query: GetPostQueryParams,
  ): Promise<PaginatedViewModel<PostViewModel[]>> {
    return await this.queryBus.execute(
      new GetPostsForSpecifiedBlogQuery(identifyUser, blogId, query),
    );
  }

  @Put(':blogId/posts/:postId')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('blogId', IdIsNumberValidationPipe) blogId: number,
    @Param('postId', IdIsNumberValidationPipe) postId: number,
    @Body() updatePostModel: UpdatePostInputModel,
  ) {
    await this.commandBus.execute(
      new UpdatePostCommand(blogId, postId, updatePostModel),
    );
  }

  @Delete(':blogId/posts/:postId')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('blogId', IdIsNumberValidationPipe) blogId: number,
    @Param('postId', IdIsNumberValidationPipe) postId: number,
  ) {
    await this.commandBus.execute(new DeletePostCommand(blogId, postId));
  }
}
