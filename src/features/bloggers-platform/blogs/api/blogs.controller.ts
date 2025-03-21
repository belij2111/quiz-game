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
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { ApiBasicAuth } from '@nestjs/swagger';
import { PaginatedViewModel } from '../../../../core/models/base.paginated.view.model';
import { CurrentUserId } from '../../../../core/decorators/param/current-user-id.param.decorator';
import { IdentifyUser } from '../../../../core/decorators/param/identify-user.param.decorator';
import { JwtOptionalAuthGuard } from '../../guards/jwt-optional-auth.guard';
import { BlogIdParamModel } from '../../posts/api/models/input/blogId-param.model';
import { BlogsSqlQueryRepository } from '../infrastructure/blogs.sql.query-repository';
import { PostsSqlQueryRepository } from '../../posts/infrastructure/posts.sql.query-repository';

@Controller('/blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
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
    return await this.blogsSqlQueryRepository.getAll(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<BlogViewModel> {
    const foundBlog = await this.blogsSqlQueryRepository.getById(id);
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
    return await this.postsSqlQueryRepository.getById(
      currentUserId,
      createdPostId,
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
    return await this.postsSqlQueryRepository.getPostsByBlogId(
      identifyUser,
      blogId,
      query,
    );
  }
}
