import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BlogViewModel } from './models/view/blog.view-model';
import { GetBlogsQueryParams } from './models/input/create-blog.input-model';
import { GetPostQueryParams } from '../../posts/api/models/input/create-post.input-model';
import { PostViewModel } from '../../posts/api/models/view/post.view-model';
import { PaginatedViewModel } from '../../../../core/models/base-paginated.view-model';
import { IdentifyUser } from '../../../../core/decorators/param/identify-user.param-decorator';
import { JwtOptionalAuthGuard } from '../../guards/jwt-optional-auth.guard';
import { QueryBus } from '@nestjs/cqrs';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query';
import { GetBlogsQuery } from '../application/queries/get-blogs.query';
import { GetPostsForSpecifiedBlogQuery } from '../../posts/application/queries/get-posts-for-specified-blog.query';
import { IdIsNumberValidationPipe } from '../../../../core/pipes/id-is-number.validation-pipe';

@Controller('blogs')
export class BlogsPublicController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async getAll(
    @Query()
    inputQuery: GetBlogsQueryParams,
  ): Promise<PaginatedViewModel<BlogViewModel[]>> {
    return await this.queryBus.execute(new GetBlogsQuery(inputQuery));
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

  @Get(':id')
  async getById(@Param('id') id: number): Promise<BlogViewModel> {
    return await this.queryBus.execute(new GetBlogByIdQuery(id));
  }
}
