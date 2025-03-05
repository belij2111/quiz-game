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

import { BlogsService } from '../application/blogs.service';
import { BlogViewModel } from './models/view/blog.view.model';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import {
  BlogCreateModel,
  GetBlogsQueryParams,
} from './models/input/create-blog.input.model';
import {
  GetPostQueryParams,
  PostCreateModel,
} from '../../posts/api/models/input/create-post.input.model';
import { PostViewModel } from '../../posts/api/models/view/post.view.model';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { ApiBasicAuth } from '@nestjs/swagger';
import { PaginatedViewModel } from '../../../../core/models/base.paginated.view.model';
import { CurrentUserId } from '../../../../core/decorators/param/current-user-id.param.decorator';
import { IdentifyUser } from '../../../../core/decorators/param/identify-user.param.decorator';
import { JwtOptionalAuthGuard } from '../../guards/jwt-optional-auth.guard';
import { BlogIdParamModel } from '../../posts/api/models/input/blogId-param.model';
import { BlogsSqlQueryRepository } from '../infrastructure/blogs.sql.query-repository';

@Controller('/blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async create(@Body() blogCreateModel: BlogCreateModel) {
    const createdBlogId = await this.blogsService.create(blogCreateModel);
    return await this.blogsSqlQueryRepository.getById(createdBlogId);
  }

  @Get()
  async getAll(
    @Query()
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewModel<BlogViewModel[]>> {
    return await this.blogsQueryRepository.getAll(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<BlogViewModel> {
    const foundBlog = await this.blogsQueryRepository.getById(id);
    if (!foundBlog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
    return foundBlog;
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() blogUpdateModel: BlogCreateModel,
  ) {
    await this.blogsService.update(id, blogUpdateModel);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.blogsService.delete(id);
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlogId(
    @CurrentUserId() currentUserId: string,
    @Param() param: BlogIdParamModel,
    @Body() postCreateModel: PostCreateModel,
  ): Promise<PostViewModel | null> {
    const blogId = param.blogId;
    const createdPostId = await this.postsService.createPostByBlogId(
      blogId,
      postCreateModel,
    );
    return await this.postsQueryRepository.getById(
      currentUserId,
      createdPostId.id,
    );
  }

  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsByBlogId(
    @IdentifyUser() identifyUser: string,
    @Param() param: BlogIdParamModel,
    @Query() query: GetPostQueryParams,
  ): Promise<PaginatedViewModel<PostViewModel[]>> {
    const blogId = param.blogId;
    return await this.postsQueryRepository.getPostsByBlogId(
      identifyUser,
      blogId,
      query,
    );
  }
}
