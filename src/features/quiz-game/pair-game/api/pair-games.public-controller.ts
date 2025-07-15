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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateConnectCommand } from '../application/use-cases/create-connect.use-case';
import { GetPairGameByIdQuery } from '../application/queries/get-pair-game-by-id.query';
import { GetPairGameOfCurrentUserQuery } from '../application/queries/get-pair-game-of current-user.query';
import { CreateAnswerOfCurrentUserCommand } from '../application/use-cases/create-answer-of-current-user.use-case';
import { GetAnswerResultQuery } from '../application/queries/get-answer-result.query';

@Controller('pair-game-quiz')
@ApiTags('PairQuizGame')
export class PairGamesPublicController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @Post('pairs/connection')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Connect current user to existing random pending pair or create new pair which will be waiting second player ',
  })
  @ApiBearerAuth()
  @ApiOkConfiguredResponse(
    GamePairViewDto,
    'Returns started existing pair or new pair with status "PendingSecondPlayer',
    false,
  )
  @ApiUnauthorizedConfiguredResponse()
  @ApiForbiddenConfiguredResponse(
    'If current user is already participating in active pair',
  )
  async createConnection(@CurrentUserId() currentUserId: string) {
    const createGameId = await this.commandBus.execute(
      new CreateConnectCommand(currentUserId),
    );
    return await this.queryBus.execute(new GetPairGameByIdQuery(createGameId));
  }

  @Get('pairs/my-current')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Return current unfinished user game' })
  @ApiBearerAuth()
  @ApiOkConfiguredResponse(
    GamePairViewDto,
    'Returns current pair in which current user is taking part',
    false,
  )
  @ApiUnauthorizedConfiguredResponse()
  @ApiNotFoundConfiguredResponse('If no active pair for current user')
  async getMyCurrent(@CurrentUserId() currentUserId: string) {
    return await this.queryBus.execute(
      new GetPairGameOfCurrentUserQuery(currentUserId),
    );
  }

  @Post('pairs/my-current/answers')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Send answer for next not answered question in active pair',
  })
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
    const createAnswerId = await this.commandBus.execute(
      new CreateAnswerOfCurrentUserCommand(currentUserId, answerInputDto),
    );
    return await this.queryBus.execute(
      new GetAnswerResultQuery(createAnswerId),
    );
  }
  @Get('pairs/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Returns game by id' })
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
    return await this.queryBus.execute(new GetPairGameByIdQuery(id));
  }
}
