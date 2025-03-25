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
import { PostsService } from '../application/posts.service';
import { PostViewModel } from './models/view/post.view.model';
import {
  GetPostQueryParams,
  PostCreateModel,
} from './models/input/create-post.input.model';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { ApiBasicAuth, ApiBearerAuth } from '@nestjs/swagger';
import { PaginatedViewModel } from '../../../../core/models/base.paginated.view.model';
import {
  CommentCreateModel,
  GetCommentQueryParams,
} from '../../comments/api/models/input/create-comment.input.model';
import { CommentsService } from '../../comments/application/comments.service';
import { CurrentUserId } from '../../../../core/decorators/param/current-user-id.param.decorator';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';
import { CommentViewModel } from '../../comments/api/models/view/comment.view.model';
import { LikeInputModel } from '../../likes/api/models/input/like.input.model';
import { IdentifyUser } from '../../../../core/decorators/param/identify-user.param.decorator';
import { JwtOptionalAuthGuard } from '../../guards/jwt-optional-auth.guard';
import { PostsSqlQueryRepository } from '../infrastructure/posts.sql.query-repository';
import { PostParamsModel } from './models/input/post-params.model';

@Controller()
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Post('posts')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async create(
    @CurrentUserId() currentUserId: string,
    @Body() postCreateModel: PostCreateModel,
  ) {
    const createdPostId = await this.postsService.create(postCreateModel);
    return await this.postsSqlQueryRepository.getById(
      currentUserId,
      createdPostId,
    );
  }

  @Get('posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getAll(
    @IdentifyUser() identifyUser: string,
    @Query() query: GetPostQueryParams,
  ): Promise<PaginatedViewModel<PostViewModel[]>> {
    return await this.postsSqlQueryRepository.getAll(identifyUser, query);
  }

  @Get('posts/:id')
  @UseGuards(JwtOptionalAuthGuard)
  async getById(
    @IdentifyUser() identifyUser: string,
    @Param('id') id: string,
  ): Promise<PostViewModel> {
    const foundPost = await this.postsSqlQueryRepository.getById(
      identifyUser,
      id,
    );
    if (!foundPost) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return foundPost;
  }

  @Put('sa/blogs/:blogId/posts/:postId')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param() params: PostParamsModel,
    @Body() postCreateModel: PostCreateModel,
  ) {
    await this.postsService.update(params, postCreateModel);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.postsService.delete(id);
  }

  @Post('/:postId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createCommentByPostId(
    @CurrentUserId() currentUserId: string,
    @Param('postId') postId: string,
    @Body() commentCreateModel: CommentCreateModel,
  ) {
    const createdUserId = await this.commentsService.create(
      currentUserId,
      postId,
      commentCreateModel,
    );
    return await this.commentsQueryRepository.getCommentById(
      currentUserId,
      createdUserId.id,
    );
  }

  @Get('/:postId/comments')
  @UseGuards(JwtOptionalAuthGuard)
  async getCommentsByPostId(
    @IdentifyUser() identifyUser: string,
    @Param('postId') postId: string,
    @Query() query: GetCommentQueryParams,
  ): Promise<PaginatedViewModel<CommentViewModel[]>> {
    return await this.commentsQueryRepository.getCommentsByPostId(
      identifyUser,
      postId,
      query,
    );
  }

  @Put('/:postId/like-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @CurrentUserId() currentUserId: string,
    @Param('postId') postId: string,
    @Body() likeInputModel: LikeInputModel,
  ) {
    await this.postsService.updateLikeStatus(
      currentUserId,
      postId,
      likeInputModel,
    );
  }
}
