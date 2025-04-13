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
import { CurrentUserId } from '../../../../core/decorators/param/current-user-id.param.decorator';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CommentViewModel } from '../../comments/api/models/view/comment.view.model';
import { LikeInputModel } from '../../likes/api/models/input/like.input.model';
import { IdentifyUser } from '../../../../core/decorators/param/identify-user.param.decorator';
import { JwtOptionalAuthGuard } from '../../guards/jwt-optional-auth.guard';
import { PostsSqlQueryRepository } from '../infrastructure/posts.sql.query-repository';
import { PostParamsModel } from './models/input/post-params.model';
import { CommentsSqlQueryRepository } from '../../comments/infrastructure/comments.sql.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';
import { UpdatePostCommand } from '../application/use-cases/update-post.use-case';
import { DeletePostCommand } from '../application/use-cases/delete-post.use-case';
import { UpdateLikeStatusForPostCommand } from '../application/use-cases/update-like-status-for post.use-case';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment.use-case';

@Controller()
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
    private readonly commentsSqlQueryRepository: CommentsSqlQueryRepository,
  ) {}

  @Post('posts')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async create(
    @CurrentUserId() currentUserId: string,
    @Body() postCreateModel: PostCreateModel,
  ) {
    const createdPostId = await this.commandBus.execute(
      new CreatePostCommand(postCreateModel),
    );
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
    await this.commandBus.execute(
      new UpdatePostCommand(params, postCreateModel),
    );
  }

  @Delete('sa/blogs/:blogId/posts/:postId')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: PostParamsModel) {
    await this.commandBus.execute(new DeletePostCommand(params));
  }

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createCommentByPostId(
    @CurrentUserId() currentUserId: string,
    @Param('postId') postId: string,
    @Body() commentCreateModel: CommentCreateModel,
  ) {
    const createdCommentId = await this.commandBus.execute(
      new CreateCommentCommand(currentUserId, postId, commentCreateModel),
    );
    return await this.commentsSqlQueryRepository.getCommentById(
      currentUserId,
      createdCommentId,
    );
  }

  @Get('posts/:postId/comments')
  @UseGuards(JwtOptionalAuthGuard)
  async getCommentsByPostId(
    @IdentifyUser() identifyUser: string,
    @Param('postId') postId: string,
    @Query() query: GetCommentQueryParams,
  ): Promise<PaginatedViewModel<CommentViewModel[]>> {
    return await this.commentsSqlQueryRepository.getCommentsByPostId(
      identifyUser,
      postId,
      query,
    );
  }

  @Put('posts/:postId/like-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @CurrentUserId() currentUserId: string,
    @Param('postId') postId: string,
    @Body() likeInputModel: LikeInputModel,
  ) {
    await this.commandBus.execute(
      new UpdateLikeStatusForPostCommand(currentUserId, postId, likeInputModel),
    );
  }
}
