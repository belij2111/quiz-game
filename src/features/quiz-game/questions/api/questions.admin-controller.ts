import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { ApiCreatedConfiguredResponse } from '../../../../core/decorators/swagger/api-created-configured-response';
import { ApiBadRequestConfiguredResponse } from '../../../../core/decorators/swagger/api-bad-request-configured-response';
import { ApiUnauthorizedConfiguredResponse } from '../../../../core/decorators/swagger/api-unauthorized-configured-response';
import {
  CreateQuestionInputDto,
  GetQuestionsQueryParams,
} from './input-dto/create-question.input-dto';
import { QuestionViewDto } from './view-dto/question.view-dto';
import { ApiOkConfiguredResponse } from '../../../../core/decorators/swagger/api-ok-configured-response';
import { ApiNoContentConfiguredResponse } from '../../../../core/decorators/swagger/api-no-content-configured-response';
import { ApiNotFoundConfiguredResponse } from '../../../../core/decorators/swagger/api-not-found-configured-response';
import { UpdateQuestionInputDto } from './input-dto/update-question.input-dto';
import { UpdatePublishInputDto } from './input-dto/update-publish.input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/use-cases/create-question.use-case';
import { GetQuestionByIdQuery } from '../application/queries/get-question-bu-id.query';
import { PaginatedViewModel } from '../../../../core/models/base-paginated.view-model';
import { GetQuestionsQuery } from '../application/queries/get-questions.query';
import { UpdateQuestionCommand } from '../application/use-cases/update-question.use-case';
import { UpdatePublishCommand } from '../application/use-cases/update-publish.use-case';
import { DeleteQuestionCommand } from '../application/use-cases/delete-question.use-case';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth()
@ApiTags('QuizQuestions')
export class QuestionsAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create question' })
  @ApiCreatedConfiguredResponse(QuestionViewDto)
  @ApiBadRequestConfiguredResponse()
  @ApiUnauthorizedConfiguredResponse()
  async create(@Body() createQuestionInputDto: CreateQuestionInputDto) {
    const createdQuestionId = await this.commandBus.execute(
      new CreateQuestionCommand(createQuestionInputDto),
    );
    return await this.queryBus.execute(
      new GetQuestionByIdQuery(createdQuestionId),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Return all questions with pagination and filtering',
  })
  @ApiOkConfiguredResponse(QuestionViewDto)
  @ApiUnauthorizedConfiguredResponse()
  async getAll(
    @Query() query: GetQuestionsQueryParams,
  ): Promise<PaginatedViewModel<QuestionViewDto[]>> {
    return await this.queryBus.execute(new GetQuestionsQuery(query));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update question' })
  @ApiNoContentConfiguredResponse()
  @ApiBadRequestConfiguredResponse()
  @ApiUnauthorizedConfiguredResponse()
  @ApiNotFoundConfiguredResponse()
  async update(
    @Param('id') id: string,
    @Body() updateQuestionInputDto: UpdateQuestionInputDto,
  ) {
    await this.commandBus.execute(
      new UpdateQuestionCommand(id, updateQuestionInputDto),
    );
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Publish/unpublish question' })
  @ApiNoContentConfiguredResponse()
  @ApiBadRequestConfiguredResponse()
  @ApiUnauthorizedConfiguredResponse()
  async updatePublish(
    @Param('id') id: string,
    @Body() updatePublishInputDto: UpdatePublishInputDto,
  ) {
    await this.commandBus.execute(
      new UpdatePublishCommand(id, updatePublishInputDto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete question' })
  @ApiNoContentConfiguredResponse()
  @ApiUnauthorizedConfiguredResponse()
  @ApiNotFoundConfiguredResponse()
  async delete(@Param('id') id: string) {
    await this.commandBus.execute(new DeleteQuestionCommand(id));
  }
}
