import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentViewModel } from './models/view/comment.view.model';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUserId } from '../../../../core/decorators/param/current-user-id.param.decorator';
import { CommentCreateModel } from './models/input/create-comment.input.model';
import { LikeInputModel } from '../../likes/api/models/input/like.input.model';
import { IdentifyUser } from '../../../../core/decorators/param/identify-user.param.decorator';
import { JwtOptionalAuthGuard } from '../../guards/jwt-optional-auth.guard';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.use-case';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.use-case';
import { UpdateLikeStatusForCommentCommand } from '../application/use-cases/update-like-status-for-comment.use-case';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.query';

@Controller('/comments')
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/:id')
  @UseGuards(JwtOptionalAuthGuard)
  async getById(
    @IdentifyUser() identifyUser: string,
    @Param('id') id: string,
  ): Promise<CommentViewModel | null> {
    const foundComment = await this.queryBus.execute(
      new GetCommentByIdQuery(identifyUser, id),
    );
    if (!foundComment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return foundComment;
  }

  @Put('/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @CurrentUserId() currentUserId: string,
    @Param('commentId') commentId: string,
    @Body() commentCreateModel: CommentCreateModel,
  ) {
    await this.commandBus.execute(
      new UpdateCommentCommand(currentUserId, commentId, commentCreateModel),
    );
  }

  @Delete('/:commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUserId() currentUserId: string,
    @Param('commentId') commentId: string,
  ) {
    await this.commandBus.execute(
      new DeleteCommentCommand(currentUserId, commentId),
    );
  }

  @Put('/:commentId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @CurrentUserId() currentUserId: string,
    @Param('commentId') commentId: string,
    @Body() likeInputModel: LikeInputModel,
  ) {
    await this.commandBus.execute(
      new UpdateLikeStatusForCommentCommand(
        currentUserId,
        commentId,
        likeInputModel,
      ),
    );
  }
}
