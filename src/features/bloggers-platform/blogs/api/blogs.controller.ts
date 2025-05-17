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

@Controller()
export class BlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('sa/blogs')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async create(@Body() blogCreateModel: CreateBlogInputModel) {
    const createdBlogId = await this.commandBus.execute(
      new CreateBlogCommand(blogCreateModel),
    );
    return await this.queryBus.execute(new GetBlogByIdQuery(createdBlogId));
  }

  @Get('blogs')
  async getAll(
    @Query()
    inputQuery: GetBlogsQueryParams,
  ): Promise<PaginatedViewModel<BlogViewModel[]>> {
    return await this.queryBus.execute(new GetBlogsQuery(inputQuery));
  }
  @Get('sa/blogs')
  @UseGuards(BasicAuthGuard)
  async getAllForAdmin(
    @Query()
    inputQuery: GetBlogsQueryParams,
  ): Promise<PaginatedViewModel<BlogViewModel[]>> {
    return await this.queryBus.execute(new GetBlogsQuery(inputQuery));
  }

  @Get('blogs/:id')
  async getById(@Param('id') id: number): Promise<BlogViewModel> {
    return await this.queryBus.execute(new GetBlogByIdQuery(id));
  }

  @Put('sa/blogs/:id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id', IdIsNumberValidationPipe) id: number,
    @Body() updateBlogModel: UpdateBlogInputModel,
  ) {
    await this.commandBus.execute(new UpdateBlogCommand(id, updateBlogModel));
  }

  @Delete('sa/blogs/:id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', IdIsNumberValidationPipe) id: number) {
    await this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @Post('sa/blogs/:blogId/posts')
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

  @Get('blogs/:blogId/posts')
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
}
