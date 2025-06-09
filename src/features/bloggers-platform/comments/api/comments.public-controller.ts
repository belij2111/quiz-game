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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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

@Controller('comments')
@ApiTags('Comments')
export class CommentsPublicController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @ApiParam({ name: 'commentId', type: String, required: true })
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

  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @ApiParam({ name: 'commentId', type: String, required: true })
  async update(
    @CurrentUserId() currentUserId: string,
    @Param('commentId', IdIsNumberValidationPipe) commentId: number,
    @Body() commentUpdateModel: UpdateCommentInputModel,
  ) {
    await this.commandBus.execute(
      new UpdateCommentCommand(currentUserId, commentId, commentUpdateModel),
    );
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @ApiParam({ name: 'commentId', type: String, required: true })
  async delete(
    @CurrentUserId() currentUserId: string,
    @Param('commentId', IdIsNumberValidationPipe) commentId: number,
  ) {
    await this.commandBus.execute(
      new DeleteCommentCommand(currentUserId, commentId),
    );
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiParam({ name: 'id', type: String, required: true })
  async getById(
    @IdentifyUser() identifyUser: string,
    @Param('id', IdIsNumberValidationPipe) id: number,
  ): Promise<CommentViewModel> {
    return await this.queryBus.execute(
      new GetCommentByIdQuery(identifyUser, id),
    );
  }
}
