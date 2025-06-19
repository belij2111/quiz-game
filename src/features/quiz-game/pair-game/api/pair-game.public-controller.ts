import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { ApiOkConfiguredResponse } from '../../../../core/decorators/swagger/api-ok-configured-response';
import { ApiUnauthorizedConfiguredResponse } from '../../../../core/decorators/swagger/api-unauthorized-configured-response';
import { ApiForbiddenConfiguredResponse } from '../../../../core/decorators/swagger/api-forbidden-configured-response';
import { CurrentUserId } from '../../../../core/decorators/param/current-user-id.param-decorator';
import { GamePairViewDto } from './view-dto/game-pair.view-dto';
import { ApiNotFoundConfiguredResponse } from '../../../../core/decorators/swagger/api-not-found-configured-response';
import { AnswerInputDto } from './input-dto/answer.input-dto';
import { AnswerViewDto } from './view-dto/answer.view-dto';
import { ApiBadRequestConfiguredResponse } from '../../../../core/decorators/swagger/api-bad-request-configured-response';

@Controller('pair-game-quiz')
@ApiTags('PairQuizGame')
export class PairGamePublicController {
  @Post('pairs/connection')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkConfiguredResponse(
    GamePairViewDto,
    'Returns started existing pair or new pair with status "PendingSecondPlayer',
  )
  @ApiUnauthorizedConfiguredResponse()
  @ApiForbiddenConfiguredResponse(
    'If current user is already participating in active pair',
  )
  async createConnection(@CurrentUserId() currentUserId: string) {
    return `Connection successfully ${currentUserId}`;
  }

  @Get('pairs/my-current')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkConfiguredResponse(
    GamePairViewDto,
    'Returns current pair in which current user is taking part',
  )
  @ApiUnauthorizedConfiguredResponse()
  @ApiNotFoundConfiguredResponse('If no active pair for current user')
  async getMyCurrent(@CurrentUserId() currentUserId: string) {
    return `my-current ${currentUserId}`;
  }

  @Post('pairs/my-current/answers')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkConfiguredResponse(AnswerViewDto, 'Returns answer result', false)
  @ApiUnauthorizedConfiguredResponse()
  @ApiForbiddenConfiguredResponse(
    'If current user is not inside active pair or user is in active pair but has already answered to all questions',
  )
  async sendAnswer(
    @CurrentUserId() currentUserId: string,
    @Body() answerInputDto: AnswerInputDto,
  ) {
    return `answers ${currentUserId} ${answerInputDto} ${AnswerViewDto}`;
  }

  @Get('pairs/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkConfiguredResponse(GamePairViewDto, 'Returns pair by id', false)
  @ApiBadRequestConfiguredResponse('If id has invalid format')
  @ApiUnauthorizedConfiguredResponse()
  @ApiForbiddenConfiguredResponse(
    'If current user tries to get pair in which user is not participant',
  )
  @ApiNotFoundConfiguredResponse('If game not found')
  @ApiParam({ name: 'id', type: String, required: true })
  async getById(@Param('id') id: string) {
    return `getById ${id} ${GamePairViewDto}`;
  }
}
