import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogViewModel } from './models/view/blog.view.model';
import {
  BlogCreateModel,
  GetBlogsQueryParams,
} from './models/input/create-blog.input.model';
import {
  GetPostQueryParams,
  PostCreateModel,
} from '../../posts/api/models/input/create-post.input.model';
import { PostViewModel } from '../../posts/api/models/view/post.view.model';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { ApiBasicAuth } from '@nestjs/swagger';
import { PaginatedViewModel } from '../../../../core/models/base.paginated.view.model';
import { CurrentUserId } from '../../../../core/decorators/param/current-user-id.param.decorator';
import { IdentifyUser } from '../../../../core/decorators/param/identify-user.param.decorator';
import { JwtOptionalAuthGuard } from '../../guards/jwt-optional-auth.guard';
import { BlogIdParamModel } from '../../posts/api/models/input/blogId-param.model';
import { BlogsSqlQueryRepository } from '../infrastructure/blogs.sql.query-repository';
import { PostsSqlQueryRepository } from '../../posts/infrastructure/posts.sql.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/use-cases/create-blog.use-case';
import { UpdateBlogCommand } from '../application/use-cases/update-blog.use-case';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog.use-case';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.use-case';

@Controller()
export class BlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository,
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
  ) {}

  @Post('sa/blogs')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async create(@Body() blogCreateModel: BlogCreateModel) {
    const createdBlogId = await this.commandBus.execute(
      new CreateBlogCommand(blogCreateModel),
    );
    return await this.blogsSqlQueryRepository.getById(createdBlogId);
  }

  @Get('blogs')
  async getAll(
    @Query()
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewModel<BlogViewModel[]>> {
    return await this.blogsSqlQueryRepository.getAll(query);
  }
  @Get('sa/blogs')
  @UseGuards(BasicAuthGuard)
  async getAllForAdmin(
    @Query()
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewModel<BlogViewModel[]>> {
    return await this.blogsSqlQueryRepository.getAll(query);
  }

  @Get('blogs/:id')
  async getById(@Param('id') id: string): Promise<BlogViewModel> {
    const foundBlog = await this.blogsSqlQueryRepository.getById(id);
    if (!foundBlog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
    return foundBlog;
  }

  @Put('sa/blogs/:id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() blogUpdateModel: BlogCreateModel,
  ) {
    await this.commandBus.execute(new UpdateBlogCommand(id, blogUpdateModel));
  }

  @Delete('sa/blogs/:id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @Post('sa/blogs/:blogId/posts')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlogId(
    @CurrentUserId() currentUserId: string,
    @Param() param: BlogIdParamModel,
    @Body() postCreateModel: PostCreateModel,
  ): Promise<PostViewModel | null> {
    const blogId = param.blogId;
    const createdPostId = await this.commandBus.execute(
      new CreatePostCommand(postCreateModel, blogId),
    );
    return await this.postsSqlQueryRepository.getById(
      currentUserId,
      createdPostId,
    );
  }

  @Get('blogs/:blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsByBlogId(
    @IdentifyUser() identifyUser: string,
    @Param() param: BlogIdParamModel,
    @Query() query: GetPostQueryParams,
  ): Promise<PaginatedViewModel<PostViewModel[]>> {
    const blogId = param.blogId;
    return await this.postsSqlQueryRepository.getPostsByBlogId(
      identifyUser,
      blogId,
      query,
    );
  }
}
