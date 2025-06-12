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
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
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
import { ApiNoContentConfiguredResponse } from '../../../../core/decorators/swagger/api-no-content-configured-response';
import { ApiBadRequestConfiguredResponse } from '../../../../core/decorators/swagger/api-bad-request-configured-response';
import { ApiUnauthorizedConfiguredResponse } from '../../../../core/decorators/swagger/api-unauthorized-configured-response';
import { ApiNotFoundConfiguredResponse } from '../../../../core/decorators/swagger/api-not-found-configured-response';
import { ApiForbiddenConfiguredResponse } from '../../../../core/decorators/swagger/api-forbidden-configured-response';
import { ApiOkConfiguredResponse } from '../../../../core/decorators/swagger/api-ok-configured-response';

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
  @ApiNoContentConfiguredResponse()
  @ApiBadRequestConfiguredResponse()
  @ApiUnauthorizedConfiguredResponse()
  @ApiNotFoundConfiguredResponse(
    'If comment with specified commentId is not exists',
  )
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
  @ApiNoContentConfiguredResponse()
  @ApiBadRequestConfiguredResponse()
  @ApiUnauthorizedConfiguredResponse()
  @ApiForbiddenConfiguredResponse(
    'If try edit the comment that is not your own',
  )
  @ApiNotFoundConfiguredResponse()
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
  @ApiNoContentConfiguredResponse()
  @ApiUnauthorizedConfiguredResponse()
  @ApiForbiddenConfiguredResponse(
    'If try delete the comment that is not your own',
  )
  @ApiNotFoundConfiguredResponse()
  @ApiParam({
    name: 'commentId',
    description: 'Comment Id',
    type: String,
    required: true,
  })
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
  @ApiOkConfiguredResponse(CommentViewModel, '', false)
  @ApiNotFoundConfiguredResponse()
  @ApiParam({
    name: 'id',
    description: 'Id of existing comment',
    type: String,
    required: true,
  })
  async getById(
    @IdentifyUser() identifyUser: string,
    @Param('id', IdIsNumberValidationPipe) id: number,
  ): Promise<CommentViewModel> {
    return await this.queryBus.execute(
      new GetCommentByIdQuery(identifyUser, id),
    );
  }
}
