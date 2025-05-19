import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentViewModel } from './models/view/comment.view.model';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUserId } from '../../../../core/decorators/param/current-user-id.param-decorator';
import { LikeInputModel } from '../../likes/api/models/input/like.input-model';
import { IdentifyUser } from '../../../../core/decorators/param/identify-user.param-decorator';
import { JwtOptionalAuthGuard } from '../../guards/jwt-optional-auth.guard';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.use-case';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.use-case';
import { UpdateLikeStatusForCommentCommand } from '../application/use-cases/update-like-status-for-comment.use-case';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.query';
import { IdIsNumberValidationPipe } from '../../../../core/pipes/id-is-number.validation-pipe';
import { UpdateCommentInputModel } from './models/input/update-comment.input-model';

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
    @Param('id', IdIsNumberValidationPipe) id: number,
  ): Promise<CommentViewModel> {
    return await this.queryBus.execute(
      new GetCommentByIdQuery(identifyUser, id),
    );
  }

  @Put('/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @CurrentUserId() currentUserId: string,
    @Param('commentId', IdIsNumberValidationPipe) commentId: number,
    @Body() commentUpdateModel: UpdateCommentInputModel,
  ) {
    await this.commandBus.execute(
      new UpdateCommentCommand(currentUserId, commentId, commentUpdateModel),
    );
  }

  @Delete('/:commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUserId() currentUserId: string,
    @Param('commentId', IdIsNumberValidationPipe) commentId: number,
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
    @Param('commentId', IdIsNumberValidationPipe) commentId: number,
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
